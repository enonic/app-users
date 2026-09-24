import { atom, computed } from 'nanostores';

import {
  $idProviderNames,
  createPrincipalNameCheck,
  createUserEmailCheck,
  isSystemUser,
  SYSTEM_ID_PROVIDER,
  type IdProviderName,
  type PrincipalRef,
  type User,
} from '../../../entities/principal';
import { mergeByKey, type FieldErrors } from '../../../shared/form';
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
  type UserEditorPayload,
  type UserForm,
  type UserFormField,
} from './user-form';

export type UserEditorMode = StepDialogMode;
export type UserEditorView = StepDialogView;
export type UserEditorState = StepDialogState<UserEditorStep, UserFormField, UserForm, User>;

export const userNameCheck = createPrincipalNameCheck('user');

export const userEmailCheck = createUserEmailCheck();

/**
 * Whether the Service Accounts section opened the dialog. Users and Service Accounts stay mounted side
 * by side and share this one store, so each section's dialog shows only what its own section opened.
 * A service account is a user of the system store: the provider is settled, never offered.
 */
export const $userEditorServiceAccount = atom(false);

// The section words a clash: a service account's provider goes without saying.
const TAKEN_KEYS = {
  users: { name: 'users.dialog.nameTaken', email: 'users.dialog.emailTaken' },
  serviceAccounts: {
    name: 'serviceAccounts.dialog.nameTaken',
    email: 'serviceAccounts.dialog.emailTaken',
  },
} satisfies Record<string, Record<'name' | 'email', string>>;

// A name or an email another user holds is an error like any other; while an answer is on its way, its
// field holds the later steps back without a message.
const $userEditorExternal = computed(
  [userNameCheck.$state, userEmailCheck.$state, $userEditorServiceAccount],
  (name, email, serviceAccount): StepDialogExternal<UserFormField> => {
    const keys = serviceAccount ? TAKEN_KEYS.serviceAccounts : TAKEN_KEYS.users;
    const errors: FieldErrors<UserFormField> = {};
    const busy: UserFormField[] = [];

    if (name.status === 'taken') {
      errors.name = keys.name;
    } else if (name.status === 'pending') {
      busy.push('name');
    }

    if (email.status === 'taken') {
      errors.email = keys.email;
    } else if (email.status === 'pending') {
      busy.push('email');
    }

    return { errors, busy };
  },
);

// ! The system store is never offered: a user there is a service account, created in its own section.
export const $userEditorProviders = computed(
  $idProviderNames,
  ({ items }): readonly IdProviderName[] => items.filter(({ key }) => key !== SYSTEM_ID_PROVIDER),
);

export const userEditorDialog = createStepDialogStore<
  UserEditorStep,
  UserFormField,
  UserForm,
  User
>({
  steps: USER_EDITOR_STEPS,
  titleKey: 'users.dialog.createTitle',
  initialForm: (payload) => initialUserForm(payload, createProvider()),
  validate: (form, { mode, entity }) =>
    validateUserForm(form, mode, entity !== undefined && isSystemUser(entity.key)),
  same: sameUserForm,
  next: nextUserForm,
  $external: $userEditorExternal,
  reset: () => {
    userNameCheck.forget();
    userEmailCheck.forget();
  },
});

export const $userEditor = userEditorDialog.$state;
export const $userEditorErrors = userEditorDialog.$errors;
export const $userEditorStepLocks = userEditorDialog.$stepLocks;

export const $userEditorSystemUser = computed(
  $userEditor,
  ({ entity }) => entity !== undefined && isSystemUser(entity.key),
);

export function openUserEditor(payload: UserEditorPayload): void {
  $userEditorServiceAccount.set(false);
  userEditorDialog.open(payload);
}

export function openUserEditorAt(user: User, step: UserEditorStep): void {
  $userEditorServiceAccount.set(false);
  userEditorDialog.openAt(user, step, user.displayName);
}

export function openServiceAccountEditor(payload: UserEditorPayload): void {
  $userEditorServiceAccount.set(true);
  userEditorDialog.open(payload, 'serviceAccounts.dialog.createTitle');
}

export function openServiceAccountEditorAt(user: User, step: UserEditorStep): void {
  $userEditorServiceAccount.set(true);
  userEditorDialog.openAt(user, step, user.displayName);
}

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

/** The provider the name and the email have to be free in, so both are asked about again at once. */
export function setUserEditorIdProvider(idProvider: string): void {
  updateUserEditorForm({ idProvider });
  askWhetherNameIsFree({ immediate: true });
  askWhetherEmailIsFree({ immediate: true });
}

export function setUserEditorEmail(email: string, { immediate = false } = {}): void {
  updateUserEditorForm({ email });
  askWhetherEmailIsFree({ immediate });
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
    userNameCheck.ask(form.idProvider, form.name, { immediate });
  }
}

// Both modes ask — an edit can re-address a user — and the user's own key rides along so its current
// address is no clash. `su` and `anonymous` have no email and are asked nothing.
function askWhetherEmailIsFree({ immediate = false } = {}): void {
  const { form, entity } = $userEditor.get();

  if (entity !== undefined && isSystemUser(entity.key)) {
    return;
  }

  userEmailCheck.ask(form.idProvider, form.email, { immediate, except: entity?.key });
}

// Where a create starts: the system store for a service account, otherwise the one provider there is.
function createProvider(): string {
  if ($userEditorServiceAccount.get()) {
    return SYSTEM_ID_PROVIDER;
  }

  const providers = $userEditorProviders.get();

  return providers.length === 1 ? (providers[0]?.key ?? '') : '';
}
