import {
  derivePrincipalName,
  isIllegalPrincipalName,
  SYSTEM_ID_PROVIDER,
  type IdProvider,
  type IdProviderAccess,
  type IdProviderPermission,
  type PrincipalRef,
} from '../../../entities/principal';
import type { FieldErrors } from '../../../shared/form';
import type { StepDialogMode, StepDialogPayload } from '../../../shared/step-dialog';

export type IdProviderEditorPayload = StepDialogPayload<IdProvider>;

export type IdProviderForm = {
  name: string;
  displayName: string;
  description: string;
  /** The application the provider is bound to. Empty means it serves no login yet. */
  application: string;
  /** Who may reach the provider, and how far. */
  permissions: readonly IdProviderPermission[];
  /** Whether the user has taken the name over; until then a create derives it from the display name. */
  nameEdited?: boolean;
};

/** What app-users grants a principal that was just added to the list. */
export const DEFAULT_ID_PROVIDER_ACCESS: IdProviderAccess = 'CREATE_USERS';

/** The provider XP owns. Its binding to the platform's own login may not be changed. */
export function isSystemIdProvider(key: string): boolean {
  return key === SYSTEM_ID_PROVIDER;
}

export type IdProviderFormField = 'name' | 'displayName' | 'permissions';

export type IdProviderFormErrors = FieldErrors<IdProviderFormField>;

export const ID_PROVIDER_FORM_FIELDS: readonly IdProviderFormField[] = [
  'name',
  'displayName',
  'permissions',
];

export function initialIdProviderForm(
  payload: IdProviderEditorPayload,
  permissions: readonly IdProviderPermission[] = [],
): IdProviderForm {
  if (payload.mode === 'create') {
    return { name: '', displayName: '', description: '', application: '', permissions };
  }

  const { entity: provider } = payload;

  return {
    name: provider.key,
    displayName: provider.displayName,
    description: provider.description ?? '',
    application: provider.application?.key ?? '',
    permissions,
  };
}

export function nextIdProviderForm(
  previous: IdProviderForm,
  next: IdProviderForm,
  { mode }: { mode: StepDialogMode },
): IdProviderForm {
  if (next.name !== previous.name) {
    return { ...next, nameEdited: true };
  }

  if (next.nameEdited === true || mode === 'edit') {
    return next;
  }

  return { ...next, name: derivePrincipalName(next.displayName) };
}

/**
 * Whether the form still says what was saved, which is what keeps `Save` dark. Permissions are compared
 * by principal *and* access: narrowing one moves no entry but is the whole edit.
 */
export function sameIdProviderForm(saved: IdProviderForm, edited: IdProviderForm): boolean {
  return (
    saved.name.trim() === edited.name.trim() &&
    saved.displayName.trim() === edited.displayName.trim() &&
    saved.description.trim() === edited.description.trim() &&
    saved.application === edited.application &&
    samePermissions(saved.permissions, edited.permissions)
  );
}

function samePermissions(
  saved: readonly IdProviderPermission[],
  edited: readonly IdProviderPermission[],
): boolean {
  if (saved.length !== edited.length) {
    return false;
  }

  return saved.every((entry) =>
    edited.some(
      ({ principal, access }) => principal.key === entry.principal.key && access === entry.access,
    ),
  );
}

export function validateIdProviderForm(
  form: IdProviderForm,
  mode: StepDialogMode,
): IdProviderFormErrors {
  const errors: IdProviderFormErrors = {};

  if (form.displayName.trim().length === 0) {
    errors.displayName = 'idProviders.dialog.displayNameRequired';
  }

  if (mode === 'create') {
    const name = form.name.trim();
    if (name.length === 0) {
      errors.name = 'idProviders.dialog.nameRequired';
    } else if (isIllegalPrincipalName(name)) {
      errors.name = 'idProviders.dialog.nameInvalid';
    }
  }

  // ! A provider nobody may reach is unmanageable from this app onwards, so app-users refuses to save
  // ! one and so does this.
  if (form.permissions.length === 0) {
    errors.permissions = 'idProviders.dialog.permissionsRequired';
  }

  return errors;
}

/**
 * The list after the picker handed over a new set of principals: an entry that survives keeps the access
 * it was given, and a new one starts where app-users starts it.
 */
export function withPermissionPrincipals(
  permissions: readonly IdProviderPermission[],
  principals: readonly PrincipalRef[],
): IdProviderPermission[] {
  return principals.map((principal) => {
    const existing = permissions.find((entry) => entry.principal.key === principal.key);
    return existing ?? { principal, access: DEFAULT_ID_PROVIDER_ACCESS };
  });
}

/**
 * The seeded entries as they appear in the list, which the dialog pins.
 *
 * Both modes, because editing one changes nothing in app-users either: it merges the defaults back over
 * whatever the provider carries every time the wizard lays out, so a narrowed level is displayed at its
 * default again and written back as the default on the next save.
 *
 * Only the entries that are actually there — a default the provider does not carry stays addable, and
 * becomes pinned once added.
 */
export function pinnedPermissions(
  permissions: readonly IdProviderPermission[],
  defaults: ReadonlySet<string>,
): ReadonlySet<string> {
  return new Set(
    permissions.map(({ principal }) => principal.key).filter((key) => defaults.has(key)),
  );
}

/**
 * The loaded list plus whatever the form gained while it was in flight — `mergeByKey` for entries keyed
 * by their principal. The loaded access wins for a principal on both sides: it is what the server holds.
 */
export function mergePermissions(
  loaded: readonly IdProviderPermission[],
  edited: readonly IdProviderPermission[],
): IdProviderPermission[] {
  const known = new Set(loaded.map(({ principal }) => principal.key));

  return [...loaded, ...edited.filter(({ principal }) => !known.has(principal.key))];
}

export function withPermissionAccess(
  permissions: readonly IdProviderPermission[],
  key: string,
  access: IdProviderAccess,
): IdProviderPermission[] {
  return permissions.map((entry) => (entry.principal.key === key ? { ...entry, access } : entry));
}
