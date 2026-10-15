const ILLEGAL_ID_CHARS = /[/\\|?*<>&"':]/g;

const ILLEGAL_OR_SPACE = /[/\\|?*<>&"':\s]/;

export function derivePrincipalName(displayName: string): string {
  return displayName.toLowerCase().replace(ILLEGAL_ID_CHARS, ' ').trim().replace(/\s+/g, '.');
}

export function isIllegalPrincipalName(name: string): boolean {
  return ILLEGAL_OR_SPACE.test(name);
}
