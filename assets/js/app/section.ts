export const SECTIONS = ['users', 'groups', 'roles', 'id-providers'] as const;

export type Section = (typeof SECTIONS)[number];

/**
 * ? Read off `host.baseUrl`, whose last segment is the extension's `<app>:<name>`, because the
 * ? contract carries no section identity and `mount` is not told which section it is.
 */
export function sectionOf(baseUrl: string): Section | undefined {
  const name = baseUrl.replace(/\/+$/, '').split('/').pop()?.split(':').pop();

  return SECTIONS.find((section) => section === name);
}
