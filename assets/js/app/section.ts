export const SECTIONS = ['users', 'groups', 'roles', 'id-providers'] as const;

export type Section = (typeof SECTIONS)[number];

/** The section behind an extension key `<app>:<name>`, which the host hands over as `host.extension`. */
export function sectionOf(extension: string): Section | undefined {
  const name = extension.split(':').pop();

  return SECTIONS.find((section) => section === name);
}
