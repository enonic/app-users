import { atom, computed } from 'nanostores';

import {
  $idProviderNames,
  $principalNameCheck,
  checkPrincipalName,
  forgetPrincipalNameChecks,
  isSystemUser,
  SYSTEM_ID_PROVIDER,
  type IdProviderName,
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
  type UserEditorPayload,
  type UserForm,
  type UserFormField,
} from './user-form';

export type UserEditorMode = StepDialogMode;
export type UserEditorView = StepDialogView;
export type UserEditorState = StepDialogState<UserEditorStep, UserFormField, UserForm, User>;

// The name a provider already holds is an error like any other; while the answer is on its way, the name
// holds the later steps back without a message.
const $userNameExternal = computed(
  $principalNameCheck,
  (check): StepDialogExternal<UserFormField> => ({
    errors: check.status === 'taken' ? { name: 'users.dialog.nameTaken' } : {},
    busy: check.status === 'pending' ? ['name'] : [],
  }),
);

// ! The system store is never offered: a user there is a service account, created in its own section.
export const $userEditorProviders = computed(
  $idProviderNames,
  ({ items }): readonly IdProviderName[] => items.filter(({ key }) => key !== SYSTEM_ID_PROVIDER),
);

/**
 * Whether the Service Accounts section opened the dialog. Users and Service Accounts stay mounted side
 * by side and share this one store, so each section's dialog shows only what its own section opened.
 * A service account is a user of the system store: the provider is settled, never offered.
 */
export const $userEditorServiceAccount = atom(false);

export const userEditorDialog = createStepDialogStore<
  UserEditorStep,
  UserFormField,
  UserForm,
  User
>({
  steps: USER_EDITOR_STEPS,
  initialForm: (payload) => initialUserForm(payload, createProvider()),
  validate: (form, { mode, entity }) =>
    validateUserForm(form, mode, entity !== undefined && isSystemUser(entity.key)),
  same: sameUserForm,
  next: nextUserForm,
  $external: $userNameExternal,
  reset: forgetPrincipalNameChecks,
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
  userEditorDialog.openAt(user, step);
}

export function openServiceAccountEditor(payload: UserEditorPayload): void {
  $userEditorServiceAccount.set(true);
  userEditorDialog.open(payload);
}

export function openServiceAccountEditorAt(user: User, step: UserEditorStep): void {
  $userEditorServiceAccount.set(true);
  userEditorDialog.openAt(user, step);
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
    checkPrincipalName('user', form.idProvider, form.name, { immediate });
  }
}

// Where a create starts: the system store for a service account, otherwise the one provider there is.
function createProvider(): string {
  if ($userEditorServiceAccount.get()) {
    return SYSTEM_ID_PROVIDER;
  }

  const providers = $userEditorProviders.get();

  return providers.length === 1 ? (providers[0]?.key ?? '') : '';
}
