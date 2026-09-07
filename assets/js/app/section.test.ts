import { describe, expect, it } from 'vitest';

import { sectionOf } from './section';

describe('sectionOf', () => {
  it('reads the section from the extension name at the end of the base url', () => {
    expect(sectionOf('com.enonic.xp.app.users:groups')).toBe('groups');
  });

  it('keeps a hyphenated section name whole', () => {
    expect(sectionOf('com.enonic.xp.app.users:id-providers')).toBe('id-providers');
  });

  it('ignores a trailing slash', () => {
    expect(sectionOf('com.enonic.xp.app.users:roles')).toBe('roles');
  });

  it('answers undefined for an extension this module ships no page for', () => {
    expect(sectionOf('com.enonic.xp.app.users:reports')).toBeUndefined();
  });

  it('does not mistake the application id for a section', () => {
    expect(sectionOf('com.enonic.xp.app.users')).toBeUndefined();
  });
});
