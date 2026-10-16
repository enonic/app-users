// XP stores a principal under its key lowercased as the node id, which must match `[a-z0-9_.:-]+`.
const PRINCIPAL_NAME = /^[A-Za-z0-9_.-]+$/;

// XP's `NameValidator` refuses these as a whole name.
const RESERVED_NAMES: ReadonlySet<string> = new Set(['_', '.', '..']);

// `IdProviderKey` also refuses the roles folder's name, in any case.
const ROLES_FOLDER = 'roles';

const COMBINING_MARKS = /\p{M}/gu;

// Any letter but a-z: one with no Latin form is dropped, not turned into a separator.
const NON_LATIN_LETTERS = /[^\P{L}a-z]/gu;

const NOT_IN_NAME = /[^a-z0-9_.-]+/g;

// A dot in an ID provider's key makes the vhost configuration key that carries it ambiguous.
const NOT_IN_ID_PROVIDER_NAME = /[^a-z0-9_-]+/g;

export function derivePrincipalName(displayName: string): string {
  return deriveName(displayName, NOT_IN_NAME, '.');
}

export function deriveIdProviderName(displayName: string): string {
  return deriveName(displayName, NOT_IN_ID_PROVIDER_NAME, '-');
}

export function isIllegalPrincipalName(name: string): boolean {
  return !PRINCIPAL_NAME.test(name) || isReservedPrincipalName(name);
}

export function isReservedPrincipalName(name: string): boolean {
  return RESERVED_NAMES.has(name);
}

export function isIllegalIdProviderName(name: string): boolean {
  return isIllegalPrincipalName(name) || isReservedIdProviderName(name);
}

export function isReservedIdProviderName(name: string): boolean {
  return isReservedPrincipalName(name) || name.toLowerCase() === ROLES_FOLDER;
}

//
// * Internal
//

function deriveName(displayName: string, notInName: RegExp, separator: string): string {
  // Lowercase before decomposing: `İ` lowercases to `i` plus a combining dot, which goes with the marks.
  return displayName
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(NON_LATIN_LETTERS, '')
    .replace(notInName, ' ')
    .trim()
    .replace(/ +/g, separator);
}
