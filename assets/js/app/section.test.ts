import { describe, expect, it } from 'vitest';

import { sectionOf } from './section';

const PREFIX = '/admin/com.enonic.xp.app.settings/main/_/admin:extension';

describe('sectionOf', () => {
  it('reads the section from the extension name at the end of the base url', () => {
    expect(sectionOf(`${PREFIX}/com.enonic.xp.app.users:groups`)).toBe('groups');
  });

  it('keeps a hyphenated section name whole', () => {
    expect(sectionOf(`${PREFIX}/com.enonic.xp.app.users:id-providers`)).toBe('id-providers');
    expect(sectionOf(`${PREFIX}/com.enonic.xp.app.users:service-accounts`)).toBe(
      'service-accounts',
    );
  });

  it('ignores a trailing slash', () => {
    expect(sectionOf(`${PREFIX}/com.enonic.xp.app.users:roles/`)).toBe('roles');
  });

  it('answers undefined for an extension this module ships no page for', () => {
    expect(sectionOf(`${PREFIX}/com.enonic.xp.app.users:reports`)).toBeUndefined();
  });

  it('does not mistake the application id for a section', () => {
    expect(sectionOf('/admin/com.enonic.xp.app.users/main')).toBeUndefined();
  });
});
