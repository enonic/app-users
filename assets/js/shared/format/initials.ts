/**
 * Two letters, as Content Studio's `PrincipalViewer` draws them: the first letter of the first two words,
 * or the first two letters of a one-word name.
 */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return '';
  }

  const initials =
    words.length === 1 ? words[0].slice(0, 2) : words[0].charAt(0) + words[1].charAt(0);

  return initials.toUpperCase();
}
