import { computed } from 'nanostores';

import {
  $idProviderNames,
  isSystemUser,
  type PrincipalRef,
  type User,
} from '../../../entities/principal';
import { mergeByKey } from '../../../shared/form';
import {
  createStepDialogStore,
  type StepDialogExternal,
  type StepDialogMode,
  type StepDialogState,
  type StepDialogView,
} from '../../../shared/step-dialog';
import { USER_EDITOR_STEPS, type UserEditorStep } from './user-editor-steps';
import {
  initialUserForm,
  nextUserForm,
  sameUserForm,
  validateUserForm,
  type PendingPublicKey,
  type UserForm,
  type UserFormField,
} from './user-form';
import { checkUserName, forgetUserNameChecks } from './user-name-check.load';
import { $userNameCheck } from './user-name-check.store';

export type UserEditorMode = StepDialogMode;
export type UserEditorView = StepDialogView;
export type UserEditorState = StepDialogState<UserEditorStep, UserFormField, UserForm, User>;

// The name a provider already holds is an error like any other; while the answer is on its way, the name
// holds the later steps back without a message.
const $userNameExternal = computed($userNameCheck, (check): StepDialogExternal<UserFormField> => ({
  errors: check.status === 'taken' ? { name: 'users.dialog.nameTaken' } : {},
  busy: check.status === 'pending' ? ['name'] : [],
}));

export const userEditorDialog = createStepDialogStore<
  UserEditorStep,
  UserFormField,
  UserForm,
  User
>({
  steps: USER_EDITOR_STEPS,
  initialForm: (payload) => initialUserForm(payload, soleProvider()),
  validate: (form, { mode, entity }) =>
    validateUserForm(form, mode, entity !== undefined && isSystemUser(entity.key)),
  same: sameUserForm,
  next: nextUserForm,
  $external: $userNameExternal,
  reset: forgetUserNameChecks,
});

export const $userEditor = userEditorDialog.$state;
export const $userEditorErrors = userEditorDialog.$errors;
export const $userEditorStepLocks = userEditorDialog.$stepLocks;

export const $userEditorSystemUser = computed(
  $userEditor,
  ({ entity }) => entity !== undefined && isSystemUser(entity.key),
);

export const openUserEditor = userEditorDialog.open;
export const openUserEditorAt = userEditorDialog.openAt;
export const closeUserEditor = userEditorDialog.close;
export const goToUserEditorStep = userEditorDialog.goToStep;
export const markUserEditorFieldVisited = userEditorDialog.markVisited;
export const updateUserEditorForm = userEditorDialog.update;

/** The memberships the server holds, which arrive long after the dialog opens. */
export function seedUserEditorMemberships(memberships: {
  roles: readonly PrincipalRef[];
  groups: readonly PrincipalRef[];
}): void {
  // The picks made while the read was in flight survive it.
  userEditorDialog.seed(memberships, (seeded, current) => ({
    roles: mergeByKey(seeded.roles ?? [], current.roles),
    groups: mergeByKey(seeded.groups ?? [], current.groups),
  }));
}

/** In the create wizard the display name is also where the name comes from, so it asks the same question. */
export function setUserEditorDisplayName(displayName: string): void {
  updateUserEditorForm({ displayName });
  askWhetherNameIsFree();
}

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
