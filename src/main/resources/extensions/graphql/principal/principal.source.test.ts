import { deletePrincipal } from '/lib/xp/auth';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { deletePrincipals, displayNameOf, localNameOf, toPrincipalItem } from './principal.source';

afterEach(() => {
  vi.resetAllMocks();
});

describe('localNameOf', () => {
  it('drops the type prefix of a role key', () => {
    expect(localNameOf('role:system.admin')).toBe('system.admin');
  });

  it('keeps only the last segment, so a user key loses its provider too', () => {
    expect(localNameOf('user:system:su')).toBe('su');
  });

  it('leaves a key with no separator alone, which is what an id provider key is', () => {
    expect(localNameOf('system')).toBe('system');
  });
});

describe('displayNameOf', () => {
  it('reports the display name the value carries', () => {
    expect(displayNameOf({ key: 'role:system.admin', displayName: 'Administrator' })).toBe(
      'Administrator',
    );
  });

  it('falls back to the name from the key when the display name is empty', () => {
    expect(displayNameOf({ key: 'role:system.admin', displayName: '' })).toBe('system.admin');
  });

  it('survives a display name the bridge never sent', () => {
    expect(displayNameOf({ key: 'role:cms.admin' })).toBe('cms.admin');
  });

  it('takes an id provider as readily as a principal', () => {
    expect(displayNameOf({ key: 'ldap' })).toBe('ldap');
  });
});

describe('toPrincipalItem', () => {
  it('keeps the key and the kind, resolving the display name', () => {
    expect(
      toPrincipalItem({ key: 'user:system:su', type: 'user', displayName: 'Super User' }),
    ).toEqual({ key: 'user:system:su', type: 'user', displayName: 'Super User' });
  });

  it('falls back to the name from the key', () => {
    expect(toPrincipalItem({ key: 'group:system:ops', type: 'group' }).displayName).toBe('ops');
  });
});

describe('deletePrincipals', () => {
  it('answers one outcome per key, in the order asked for', () => {
    vi.mocked(deletePrincipal).mockReturnValue(true);

    expect(deletePrincipals(['role:a', 'group:system:ops'])).toEqual([
      { key: 'role:a', deleted: true },
      { key: 'group:system:ops', deleted: true },
    ]);
  });

  it('deletes each key on its own', () => {
    vi.mocked(deletePrincipal).mockReturnValue(true);

    deletePrincipals(['role:a', 'role:b']);

    expect(vi.mocked(deletePrincipal).mock.calls).toEqual([['role:a'], ['role:b']]);
  });

  it('reads false as nothing answering to the key', () => {
    vi.mocked(deletePrincipal).mockReturnValue(false);

    expect(deletePrincipals(['role:gone'])).toEqual([
      { key: 'role:gone', deleted: false, reason: 'No principal answers to [role:gone]' },
    ]);
  });

  it('reports the platform message when a key is refused', () => {
    vi.mocked(deletePrincipal).mockImplementation(() => {
      throw new Error('Not allowed to delete principal [user:system:su]');
    });

    expect(deletePrincipals(['user:system:su'])).toEqual([
      {
        key: 'user:system:su',
        deleted: false,
        reason: 'Not allowed to delete principal [user:system:su]',
      },
    ]);
  });

  it('still names a refusal that carried no message', () => {
    vi.mocked(deletePrincipal).mockImplementation(() => {
      throw new Error('');
    });

    expect(deletePrincipals(['role:a'])[0]?.reason).toBe(
      'The platform refused the delete without saying why',
    );
  });

  it('keeps going after a key that throws', () => {
    vi.mocked(deletePrincipal).mockImplementation((key) => {
      if (key === 'role:not valid') {
        throw new Error('Invalid role key');
      }
      return true;
    });

    expect(deletePrincipals(['role:not valid', 'role:b']).map(({ deleted }) => deleted)).toEqual([
      false,
      true,
    ]);
  });

  it('asks the platform nothing for an empty list', () => {
    expect(deletePrincipals([])).toEqual([]);
    expect(vi.mocked(deletePrincipal)).not.toHaveBeenCalled();
  });
});
