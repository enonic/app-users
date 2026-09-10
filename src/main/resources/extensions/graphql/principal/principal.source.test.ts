import {
  deletePrincipal,
  findPrincipals,
  type FindPrincipalsParams,
  type Group,
  type Role,
  type User,
} from '/lib/xp/auth';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  deletePrincipals,
  displayNameOf,
  localNameOf,
  searchPrincipals,
  toPrincipalItem,
} from './principal.source';

function user(name: string): User {
  return {
    type: 'user',
    key: `user:system:${name}`,
    displayName: name,
    disabled: false,
    login: name,
    idProvider: 'system',
    hasPassword: true,
    modifiedTime: '2026-08-01T10:00:00Z',
  };
}

function group(name: string): Group {
  return {
    type: 'group',
    key: `group:system:${name}`,
    displayName: name,
    modifiedTime: '2026-08-01T10:00:00Z',
  };
}

function role(name: string): Role {
  return {
    type: 'role',
    key: `role:${name}`,
    displayName: name,
    modifiedTime: '2026-08-01T10:00:00Z',
  };
}

function directory(held: Record<string, (User | Group | Role)[]>): void {
  vi.mocked(findPrincipals).mockImplementation(({ type, start = 0, count = 10 }) => {
    const rows = type === undefined ? Object.values(held).flat() : (held[type] ?? []);
    const hits = rows.slice(start, start + count);

    return { total: rows.length, count: hits.length, hits };
  });
}

function calls(): FindPrincipalsParams[] {
  return vi.mocked(findPrincipals).mock.calls.map(([params]) => params);
}

function keys(page: { hits: { key: string }[] }): string[] {
  return page.hits.map(({ key }) => key);
}

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

describe('searchPrincipals', () => {
  it('reads one kind as one page of that kind, in the order the search answered', () => {
    directory({ group: [group('zoo'), group('admins')] });

    const page = searchPrincipals({ types: ['group'], search: ' adm ', start: 0, count: 20 });

    expect(page).toEqual({
      total: 2,
      hits: [
        { key: 'group:system:zoo', type: 'group', displayName: 'zoo' },
        { key: 'group:system:admins', type: 'group', displayName: 'admins' },
      ],
    });
    expect(calls()).toEqual([
      { type: 'group', idProvider: undefined, searchText: 'adm', start: 0, count: 20 },
    ]);
  });

  it('fills a page from the first kind and continues into the next where it ran out', () => {
    directory({ user: [user('a'), user('b'), user('c')], group: [group('x'), group('y')] });

    const page = searchPrincipals({ types: ['user', 'group'], start: 0, count: 4 });

    expect(keys(page)).toEqual([
      'user:system:a',
      'user:system:b',
      'user:system:c',
      'group:system:x',
    ]);
    expect(page.total).toBe(5);
    expect(calls()).toEqual([
      { type: 'user', idProvider: undefined, searchText: undefined, start: 0, count: 4 },
      { type: 'group', idProvider: undefined, searchText: undefined, start: 0, count: 1 },
    ]);
  });

  it('offsets the next kind by what the first one already answered', () => {
    directory({ user: [user('a'), user('b'), user('c')], group: [group('x'), group('y')] });

    const page = searchPrincipals({ types: ['user', 'group'], start: 4, count: 4 });

    expect(keys(page)).toEqual(['group:system:y']);
    expect(calls()[1]).toEqual({
      type: 'group',
      idProvider: undefined,
      searchText: undefined,
      start: 1,
      count: 4,
    });
  });

  it('still counts a kind the page never reached, without fetching a row of it', () => {
    directory({ user: [user('a'), user('b')], group: [group('x'), group('y'), group('z')] });

    const page = searchPrincipals({ types: ['user', 'group'], start: 0, count: 2 });

    expect(keys(page)).toEqual(['user:system:a', 'user:system:b']);
    expect(page.total).toBe(5);
    expect(calls()[1]?.count).toBe(0);
  });

  it('keeps the kinds in the order asked for', () => {
    directory({ user: [user('a')], group: [group('x')] });

    expect(keys(searchPrincipals({ types: ['group', 'user'], count: 20 }))).toEqual([
      'group:system:x',
      'user:system:a',
    ]);
  });

  it('asks for every kind in one read, with no type, when all three are wanted', () => {
    directory({ user: [user('a')], group: [group('x')], role: [role('r')] });

    const page = searchPrincipals({ types: ['role', 'user', 'group'], idProvider: 'system' });

    expect(page.total).toBe(3);
    expect(calls()).toEqual([
      { type: undefined, idProvider: 'system', searchText: undefined, start: 0, count: 20 },
    ]);
  });

  it('reads no kinds as every kind', () => {
    directory({ role: [role('r')] });

    searchPrincipals({ types: [] });

    expect(calls()[0]?.type).toBeUndefined();
  });

  it('drops a provider and a search that are empty', () => {
    directory({});

    searchPrincipals({ types: ['user'], idProvider: '', search: '   ' });

    expect(calls()[0]).toEqual({
      type: 'user',
      idProvider: undefined,
      searchText: undefined,
      start: 0,
      count: 20,
    });
  });

  it('clamps the page inside the result window', () => {
    directory({});

    searchPrincipals({ types: ['user'], start: 50_000, count: -1 });

    const [asked] = calls();
    expect(asked?.count).toBe(0);
    expect((asked?.start ?? 0) + (asked?.count ?? 0)).toBeLessThanOrEqual(10_000);
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
