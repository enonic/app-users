const ILLEGAL_ID_CHARS = /[/\\|?*<>&"':]/g;

// XP stores a principal under its key lowercased as the node id, which must match `[a-z0-9_.:-]+`.
const PRINCIPAL_NAME = /^[A-Za-z0-9_.-]+$/;

// XP's `NameValidator` refuses these as a whole name.
const RESERVED_NAMES: ReadonlySet<string> = new Set(['_', '.', '..']);

// `IdProviderKey` also refuses the roles folder's name, in any case.
const ROLES_FOLDER = 'roles';

export function derivePrincipalName(displayName: string): string {
  return displayName.toLowerCase().replace(ILLEGAL_ID_CHARS, ' ').trim().replace(/\s+/g, '.');
}

export function isIllegalPrincipalName(name: string): boolean {
  return !PRINCIPAL_NAME.test(name) || RESERVED_NAMES.has(name);
}

export function isIllegalIdProviderName(name: string): boolean {
  return isIllegalPrincipalName(name) || name.toLowerCase() === ROLES_FOLDER;
}
