import { computed, map } from 'nanostores';

import {
  $idProviderNames,
  isSystemUser,
  type PrincipalRef,
  type User,
} from '../../../entities/principal';
import { mergeByKey } from '../../../shared/form';
import { lockedUserEditorSteps, USER_EDITOR_STEPS, type UserEditorStep } from './user-editor-steps';
import {
  initialUserForm,
  nextUserForm,
  validateUserForm,
  type PendingPublicKey,
  type UserForm,
  type UserFormErrors,
  type UserFormField,
} from './user-form';
import { checkUserName, forgetUserNameChecks } from './user-name-check.load';
import { $userNameCheck } from './user-name-check.store';

export type UserEditorMode = 'create' | 'edit';

/**
 * `wizard` walks every step; `step` shows one of them alone, with Cancel and Save where the stepper
 * would be. The details panel opens a section that way, to edit the part of the user it is showing.
 */
export type UserEditorView = 'wizard' | 'step';

export type UserEditorPayload = { mode: 'create' } | { mode: 'edit'; user: User };

export type UserEditorState = {
  open: boolean;
  mode: UserEditorMode;
  view: UserEditorView;
  step: UserEditorStep;
  form: UserForm;
  /** The form as the server last answered it, which is what an edit diffs against. */
  saved: UserForm;
  user?: User;
  nameEdited: boolean;
  membershipsSeeded: boolean;
  visited: ReadonlySet<UserFormField>;
  saving: boolean;
};

const FIRST_STEP: UserEditorStep = USER_EDITOR_STEPS.identity;

const INITIAL: UserEditorState = {
  open: false,
  mode: 'create',
  view: 'wizard',
  step: FIRST_STEP,
  form: initialUserForm({ mode: 'create' }),
  saved: initialUserForm({ mode: 'create' }),
  nameEdited: false,
  membershipsSeeded: false,
  visited: new Set(),
  saving: false,
};

export const $userEditor = map<UserEditorState>({ ...INITIAL });

export const $userEditorSystemUser = computed(
  $userEditor,
  ({ user }) => user !== undefined && isSystemUser(user.key),
);

/**
 * ! The name a provider already holds is an error like any other, so the save's own gate turns the user
 * ! back to the step carrying it. It never overrules a local message: an empty or illegal name is not
 * ! asked about in the first place.
 */
export const $userEditorErrors = computed(
  [$userEditor, $userEditorSystemUser, $userNameCheck],
  ({ form, mode }, systemUser, check): UserFormErrors => {
    const errors = validateUserForm(form, mode, systemUser);

    if (check.status === 'taken' && errors.name === undefined) {
      return { ...errors, name: 'users.dialog.nameTaken' };
    }

    return errors;
  },
);

export const $userEditorStepLocks = computed([$userEditorErrors, $userNameCheck], (errors, check) =>
  lockedUserEditorSteps(errors, check.status === 'pending' ? (['name'] as const) : []),
);

export function openUserEditor(payload: UserEditorPayload): void {
  const form = initialUserForm(payload, soleProvider());

  forgetUserNameChecks();

  $userEditor.set({
    ...INITIAL,
    open: true,
    mode: payload.mode,
    user: payload.mode === 'edit' ? payload.user : undefined,
    form,
    saved: form,
  });
}

/**
 * One step of an existing user, on its own: no stepper, no dots, Cancel and Save.
 *
 * Edit only since a create needs every step answered, which is also why the save keeps its whole-form gate
 * here: the user it opens on is one the form already accepts.
 */
export function openUserEditorAt(user: User, step: UserEditorStep): void {
  const form = initialUserForm({ mode: 'edit', user });

  forgetUserNameChecks();

  $userEditor.set({
    ...INITIAL,
    open: true,
    mode: 'edit',
    view: 'step',
    step,
    user,
    form,
    saved: form,
  });
}

/**
 * The memberships the server holds, which arrive long after the dialog opens.
 *
 * ! They join `saved` as well as `form`: a seeded role the user never touched is not an addition, and
 * ! diffing against a baseline without them would add every one of them again.
 */
export function seedUserEditorMemberships(memberships: {
  roles: readonly PrincipalRef[];
  groups: readonly PrincipalRef[];
}): void {
  const state = $userEditor.get();

  if (state.membershipsSeeded) {
    return;
  }

  $userEditor.set({
    ...state,
    membershipsSeeded: true,
    // The picks made while the read was in flight survive it.
    form: {
      ...state.form,
      roles: mergeByKey(memberships.roles, state.form.roles),
      groups: mergeByKey(memberships.groups, state.form.groups),
    },
    saved: { ...state.saved, roles: memberships.roles, groups: memberships.groups },
  });
}

export function closeUserEditor(): void {
  forgetUserNameChecks();
  $userEditor.set({ ...INITIAL });
}

export function beginUserEditorSave(): void {
  $userEditor.setKey('saving', true);
}

export function endUserEditorSave(): void {
  $userEditor.setKey('saving', false);
}

export function markUserEditorFieldVisited(field: UserFormField): void {
  const { visited } = $userEditor.get();

  if (visited.has(field)) {
    return;
  }

  $userEditor.setKey('visited', new Set([...visited, field]));
}

export function goToUserEditorStep(step: UserEditorStep): void {
  $userEditor.setKey('step', step);
}

/**
 * The display name, which in the create wizard is also where the name comes from until the user takes
 * that field over — so it asks the same question the name field does.
 */
export function setUserEditorDisplayName(displayName: string): void {
  updateUserEditorForm({ displayName });
  askWhetherNameIsFree();
}

/**
 * The name, and the question of whether it is free. Only the create wizard asks: an edit cannot rename,
 * and a name derived from the display name is checked the same as one typed by hand.
 */
export function setUserEditorName(name: string, { immediate = false } = {}): void {
  updateUserEditorForm({ name });
  askWhetherNameIsFree({ immediate });
}

/** The provider the name has to be free in, so a name already typed is asked about again at once. */
export function setUserEditorIdProvider(idProvider: string): void {
  updateUserEditorForm({ idProvider });
  askWhetherNameIsFree({ immediate: true });
}

export function setUserEditorPassword(password: string | undefined): void {
  updateUserEditorForm({ password, clearPassword: false });
}

export function clearUserEditorPassword(cleared: boolean): void {
  updateUserEditorForm({ password: undefined, clearPassword: cleared });
}

export function stagePublicKey(pending: Omit<PendingPublicKey, 'id'>): void {
  const { keyAdditions } = $userEditor.get().form;

  updateUserEditorForm({
    keyAdditions: [...keyAdditions, { ...pending, id: crypto.randomUUID() }],
  });
}

export function dropStagedPublicKey(id: string): void {
  const { keyAdditions } = $userEditor.get().form;

  updateUserEditorForm({ keyAdditions: keyAdditions.filter((pending) => pending.id !== id) });
}

export function stagePublicKeyRemoval(kid: string): void {
  const { keyRemovals } = $userEditor.get().form;

  updateUserEditorForm({
    keyRemovals: keyRemovals.includes(kid) ? keyRemovals : [...keyRemovals, kid],
  });
}

export function keepPublicKey(kid: string): void {
  const { keyRemovals } = $userEditor.get().form;

  updateUserEditorForm({ keyRemovals: keyRemovals.filter((staged) => staged !== kid) });
}

export function updateUserEditorForm(patch: Partial<UserForm>): void {
  const state = $userEditor.get();
  const { values, nameEdited } = nextUserForm(
    state.form,
    { ...state.form, ...patch },
    state.mode,
    state.nameEdited,
  );

  $userEditor.set({ ...state, form: values, nameEdited });
}

//
// * Internal
//

// Only the create wizard asks: an edit cannot rename, so its name is nobody's to take.
function askWhetherNameIsFree({ immediate = false } = {}): void {
  const { form, mode } = $userEditor.get();

  if (mode === 'create') {
    checkUserName(form.idProvider, form.name, { immediate });
  }
}

function soleProvider(): string {
  const { items } = $idProviderNames.get();

  return items.length === 1 ? (items[0]?.key ?? '') : '';
}
