import { generateKid } from '/lib/publickey';
import {
  addMembers,
  changePassword,
  createUser as createUserPrincipal,
  findUsers,
  getIdProviders,
  getMemberships,
  getPrincipal,
  getProfile,
  modifyProfile,
  modifyUser,
  removeMembers,
  type Group,
  type IdProvider,
  type Role,
  type User,
} from '/lib/xp/auth';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  addPublicKey,
  createUser,
  escapeQueryValue,
  getUser,
  listUserGroups,
  listUserPublicKeys,
  listUserRoles,
  listUsers,
  removePublicKey,
  updateUser,
  type UserChanges,
  type UserInput,
} from './user.source';

function user(name: string, displayName: string): User {
  return {
    type: 'user',
    key: `user:system:${name}` as User['key'],
    displayName,
    login: name,
    idProvider: 'system',
    hasPassword: true,
  };
}

function group(key: string, displayName: string): Group {
  return {
    type: 'group',
    key: key as Group['key'],
    displayName,
    modifiedTime: '2026-08-01T10:00:00Z',
  };
}

function role(key: string, displayName: string): Role {
  return {
    type: 'role',
    key: key as Role['key'],
    displayName,
    modifiedTime: '2026-08-01T10:00:00Z',
  };
}

function found(hits: User[], total = hits.length) {
  return { total, count: hits.length, hits };
}

/** The single argument `findUsers` was called with. */
function calledWith() {
  return vi.mocked(findUsers).mock.calls[0]?.[0];
}

afterEach(() => {
  vi.resetAllMocks();
});

describe('listUsers', () => {
  it('answers with the page and the size of the whole match', () => {
    vi.mocked(findUsers).mockReturnValue(found([user('alice', 'Alice Ward')], 137));

    expect(listUsers({ start: 0, count: 50 })).toEqual({
      total: 137,
      hits: [user('alice', 'Alice Ward')],
    });
  });

  it('pages from where it was asked to', () => {
    vi.mocked(findUsers).mockReturnValue(found([]));

    listUsers({ start: 100, count: 50 });

    expect(calledWith()?.start).toBe(100);
    expect(calledWith()?.count).toBe(50);
  });

  it('asks for fifty when no page size was given', () => {
    vi.mocked(findUsers).mockReturnValue(found([]));

    listUsers({});

    expect(calledWith()?.count).toBe(50);
  });

  it('caps the page size, whatever it was asked for', () => {
    vi.mocked(findUsers).mockReturnValue(found([]));

    listUsers({ count: 100000 });

    expect(calledWith()?.count).toBe(100);
  });

  // ! An upper bound alone would let this through: `count: -1` is `GET_ALL_SIZE_FLAG`, so `findUsers`
  // ! would read the whole directory inside the app's one JS thread.
  it('refuses a negative page size rather than reading every user', () => {
    vi.mocked(findUsers).mockReturnValue(found([]));

    listUsers({ count: -1 });

    expect(calledWith()?.count).toBe(0);
  });

  // Zero is not a mistake: it asks for the total and no rows at all.
  it('passes a zero page size through, since it is a count without rows', () => {
    vi.mocked(findUsers).mockReturnValue(found([], 137));

    expect(listUsers({ count: 0 })).toEqual({ total: 137, hits: [] });
    expect(calledWith()?.count).toBe(0);
  });

  // ! Elasticsearch refuses `from + size` past its result window and `SecurityServiceImpl` does not catch
  // ! it, so an unclamped offset blanks the whole list rather than ending the paging.
  it('stops paging at the result window rather than letting the search fail', () => {
    vi.mocked(findUsers).mockReturnValue(found([]));

    listUsers({ start: 50_000, count: 50 });

    expect(calledWith()?.start).toBe(9900);
  });

  // ! The two clamps are one rule: `from + size` must stay inside the result window, so raising the page
  // ! size without lowering the reach would breach it again.
  it('keeps the furthest page inside the result window', () => {
    vi.mocked(findUsers).mockReturnValue(found([]));

    listUsers({ start: 50_000, count: 50_000 });

    const asked = calledWith();
    expect((asked?.start ?? 0) + (asked?.count ?? 0)).toBeLessThanOrEqual(10_000);
  });

  it('refuses a negative offset', () => {
    vi.mocked(findUsers).mockReturnValue(found([]));

    listUsers({ start: -10 });

    expect(calledWith()?.start).toBe(0);
  });

  it('searches with no constraint at all when nothing narrows it', () => {
    vi.mocked(findUsers).mockReturnValue(found([]));

    listUsers({});

    expect(calledWith()?.query).toBe('');
  });

  it('searches display name and all text, whole words or a typed prefix', () => {
    vi.mocked(findUsers).mockReturnValue(found([]));

    listUsers({ search: 'alice' });

    expect(calledWith()?.query).toBe(
      '(fulltext("_allText,displayName","alice","AND") OR ngram("_allText,displayName","alice","AND"))',
    );
  });

  it('ignores a blank search', () => {
    vi.mocked(findUsers).mockReturnValue(found([]));

    listUsers({ search: '   ' });

    expect(calledWith()?.query).toBe('');
  });

  it('filters by provider through the node property that carries it', () => {
    vi.mocked(findUsers).mockReturnValue(found([]));

    listUsers({ idProviders: ['ldap'] });

    expect(calledWith()?.query).toBe('userStoreKey="ldap"');
  });

  it('ORs several providers, so the filter can tick more than one', () => {
    vi.mocked(findUsers).mockReturnValue(found([]));

    listUsers({ idProviders: ['ldap', 'system'] });

    expect(calledWith()?.query).toBe('(userStoreKey="ldap" OR userStoreKey="system")');
  });

  it('ignores an empty provider list', () => {
    vi.mocked(findUsers).mockReturnValue(found([]));

    listUsers({ idProviders: [] });

    expect(calledWith()?.query).toBe('');
  });

  it('combines a search and a provider filter', () => {
    vi.mocked(findUsers).mockReturnValue(found([]));

    listUsers({ search: 'alice', idProviders: ['ldap'] });

    expect(calledWith()?.query).toBe(
      '(fulltext("_allText,displayName","alice","AND") OR ngram("_allText,displayName","alice","AND")) AND userStoreKey="ldap"',
    );
  });

  // ! A typed quote used to be enough to break the query on app-users. It has to reach the parser as a
  // ! literal, not as the end of one.
  it('escapes a quote in the search rather than ending the literal', () => {
    vi.mocked(findUsers).mockReturnValue(found([]));

    listUsers({ search: 'say "hi"' });

    expect(calledWith()?.query).toContain('"say \\"hi\\""');
  });

  it('escapes the provider filter too, not only the search', () => {
    vi.mocked(findUsers).mockReturnValue(found([]));

    listUsers({ idProviders: ['od"d'] });

    expect(calledWith()?.query).toBe('userStoreKey="od\\"d"');
  });

  // ! The tie-break has to be a field that is actually written and unique, or paging is unsound: an
  // ! unwritten property is silently ignored by the sort, and `_name` repeats across providers.
  it('orders by display name, with the node path breaking ties', () => {
    vi.mocked(findUsers).mockReturnValue(found([]));

    listUsers({ sort: 'displayNameAsc' });
    expect(calledWith()?.sort).toBe('displayName ASC, _path ASC');

    vi.resetAllMocks();
    vi.mocked(findUsers).mockReturnValue(found([]));
    listUsers({ sort: 'displayNameDesc' });
    expect(calledWith()?.sort).toBe('displayName DESC, _path ASC');
  });

  it('orders by display name ascending when nothing was asked for', () => {
    vi.mocked(findUsers).mockReturnValue(found([]));

    listUsers({});

    expect(calledWith()?.sort).toBe('displayName ASC, _path ASC');
  });
});

describe('escapeQueryValue', () => {
  it('escapes a double quote', () => {
    expect(escapeQueryValue('say "hi"')).toBe('say \\"hi\\"');
  });

  it('escapes a backslash before the quotes, so an escape is not escaped twice', () => {
    expect(escapeQueryValue('c:\\path "x"')).toBe('c:\\\\path \\"x\\"');
  });

  it('leaves an ordinary value alone', () => {
    expect(escapeQueryValue('alice ward')).toBe('alice ward');
  });
});

describe('getUser', () => {
  it('answers with the user a key names', () => {
    vi.mocked(getPrincipal).mockReturnValue(user('alice', 'Alice Ward'));

    expect(getUser('user:system:alice')).toEqual(user('alice', 'Alice Ward'));
  });

  it('answers null for a key no user holds, which is not a failure', () => {
    vi.mocked(getPrincipal).mockReturnValue(null);

    expect(getUser('user:system:nobody')).toBeNull();
  });

  // ! `getPrincipal` answers for whatever a key names, so without a shape check a group would be served
  // ! as a user and its memberships read as that user's.
  it('answers null for a key that names something other than a user, without asking', () => {
    expect(getUser('group:system:editors')).toBeNull();
    expect(getUser('role:system.admin')).toBeNull();
    expect(vi.mocked(getPrincipal)).not.toHaveBeenCalled();
  });

  // ! `PrincipalKey.from` throws on a key it cannot parse, so an unchecked one would surface as a failed
  // ! request instead of nothing found — `/users/garbage` is reachable from the address bar.
  it('answers null for a malformed key rather than letting the platform throw', () => {
    expect(getUser('garbage')).toBeNull();
    expect(getUser('user:system:alice:extra')).toBeNull();
    expect(getUser('')).toBeNull();
    expect(vi.mocked(getPrincipal)).not.toHaveBeenCalled();
  });

  // ! The shape check is only a superset of what XP accepts — `ID_VALIDATOR` also rejects spaces and HTML
  // ! specials, and does it by throwing. A key that gets past the pattern and dies in the platform still
  // ! has to read as "no such user".
  it('answers null for a key the platform itself refuses to parse', () => {
    vi.mocked(getPrincipal).mockImplementation(() => {
      throw new Error('Invalid principal id: al ice');
    });

    expect(getUser('user:system:al ice')).toBeNull();
  });
});

describe('listUserRoles and listUserGroups', () => {
  it('passes the caller through to the platform, both ways', () => {
    vi.mocked(getMemberships).mockReturnValue([]);

    listUserRoles('user:system:alice' as User['key'], true);
    expect(vi.mocked(getMemberships)).toHaveBeenCalledWith('user:system:alice', true);

    listUserGroups('user:system:alice' as User['key'], false);
    expect(vi.mocked(getMemberships)).toHaveBeenCalledWith('user:system:alice', false);
  });

  it('splits the memberships and sorts each by display name', () => {
    vi.mocked(getMemberships).mockReturnValue([
      role('role:system.admin', 'Administrator'),
      group('group:system:editors', 'Editors'),
      group('group:system:contributors', 'Contributors'),
    ]);

    expect(listUserRoles('user:system:alice' as User['key'], true).map(({ key }) => key)).toEqual([
      'role:system.admin',
    ]);
    expect(
      listUserGroups('user:system:alice' as User['key'], true).map(
        ({ displayName }) => displayName,
      ),
    ).toEqual(['Contributors', 'Editors']);
  });

  it('answers empty for a user in nothing', () => {
    vi.mocked(getMemberships).mockReturnValue([]);

    expect(listUserRoles('user:system:alice' as User['key'], true)).toEqual([]);
  });
});

describe('listUserPublicKeys', () => {
  it('answers empty for a profile that carries none', () => {
    vi.mocked(getProfile).mockReturnValue({});

    expect(listUserPublicKeys('user:system:alice')).toEqual([]);
  });

  it('answers empty for a user with no profile at all', () => {
    vi.mocked(getProfile).mockReturnValue(null);

    expect(listUserPublicKeys('user:system:alice')).toEqual([]);
  });

  it('wraps a single key, which the profile does not store as an array', () => {
    const key = { kid: 'abc', label: 'Laptop' };
    vi.mocked(getProfile).mockReturnValue({ publicKeys: key });

    expect(listUserPublicKeys('user:system:alice')).toEqual([key]);
  });

  it('passes several through in order', () => {
    const keys = [{ kid: 'abc' }, { kid: 'def' }];
    vi.mocked(getProfile).mockReturnValue({ publicKeys: keys });

    expect(listUserPublicKeys('user:system:alice')).toEqual(keys);
  });
});

describe('createUser', () => {
  function input(overrides: Partial<UserInput> = {}): UserInput {
    return { displayName: 'Alice', roles: [], groups: [], ...overrides };
  }

  function providers(...keys: string[]): void {
    vi.mocked(getIdProviders).mockReturnValue(
      keys.map((key) => ({ key, displayName: key }) as IdProvider),
    );
  }

  it('creates the user in the provider named, from the scalars given', () => {
    providers('system');
    vi.mocked(createUserPrincipal).mockReturnValue(user('alice', 'Alice'));

    createUser('system', 'alice', input({ email: 'alice@example.com' }));

    expect(vi.mocked(createUserPrincipal)).toHaveBeenCalledWith({
      idProvider: 'system',
      name: 'alice',
      displayName: 'Alice',
      email: 'alice@example.com',
    });
  });

  it('sets a password when one was given, against the key the platform answered', () => {
    providers('system');
    vi.mocked(createUserPrincipal).mockReturnValue(user('alice', 'Alice'));

    createUser('system', 'alice', input({ password: 'Str0ng!Passw0rd' }));

    expect(vi.mocked(changePassword)).toHaveBeenCalledWith({
      userKey: 'user:system:alice',
      password: 'Str0ng!Passw0rd',
    });
  });

  it('leaves a user without a password alone rather than clearing one', () => {
    providers('system');
    vi.mocked(createUserPrincipal).mockReturnValue(user('alice', 'Alice'));

    createUser('system', 'alice', input());

    expect(vi.mocked(changePassword)).not.toHaveBeenCalled();
  });

  it('adds every role and group listed, each against its own key', () => {
    providers('system');
    vi.mocked(createUserPrincipal).mockReturnValue(user('alice', 'Alice'));

    createUser(
      'system',
      'alice',
      input({ roles: ['role:cms.admin'], groups: ['group:system:editors'] }),
    );

    expect(vi.mocked(addMembers)).toHaveBeenCalledWith('role:cms.admin', ['user:system:alice']);
    expect(vi.mocked(addMembers)).toHaveBeenCalledWith('group:system:editors', [
      'user:system:alice',
    ]);
  });

  it('refuses a provider that no longer exists, without creating anything', () => {
    providers('store');

    expect(() => createUser('gone', 'alice', input())).toThrow('No ID provider answers to [gone]');
    expect(vi.mocked(createUserPrincipal)).not.toHaveBeenCalled();
  });

  it('answers the user the platform created', () => {
    providers('system');
    const created = user('alice', 'Alice');
    vi.mocked(createUserPrincipal).mockReturnValue(created);

    expect(createUser('system', 'alice', input())).toBe(created);
  });
});

describe('updateUser', () => {
  function changes(overrides: Partial<UserChanges> = {}): UserChanges {
    return {
      displayName: 'Alice',
      addRoles: [],
      removeRoles: [],
      addGroups: [],
      removeGroups: [],
      ...overrides,
    };
  }

  function modifiable(name: string) {
    vi.mocked(getPrincipal).mockReturnValue(user(name, 'Whatever'));
    vi.mocked(modifyUser).mockImplementation(({ editor }) =>
      editor({ ...user(name, 'Whatever'), email: 'before@example.com' }),
    );
  }

  it('writes the scalars through the editor the platform hands it', () => {
    modifiable('alice');

    const updated = updateUser(
      'user:system:alice',
      changes({ displayName: 'Alice Smith', email: 'after@example.com' }),
    );

    expect(updated.displayName).toBe('Alice Smith');
    expect(updated.email).toBe('after@example.com');
  });

  it('clears an email the edit dropped, with an empty string rather than nothing', () => {
    modifiable('alice');

    expect(updateUser('user:system:alice', changes()).email).toBe('');
  });

  it('touches no password and no membership when only the scalars moved', () => {
    modifiable('alice');

    updateUser('user:system:alice', changes({ displayName: 'Alice Smith' }));

    expect(vi.mocked(changePassword)).not.toHaveBeenCalled();
    expect(vi.mocked(getMemberships)).not.toHaveBeenCalled();
    expect(vi.mocked(addMembers)).not.toHaveBeenCalled();
    expect(vi.mocked(removeMembers)).not.toHaveBeenCalled();
  });

  it('sets a password that was given', () => {
    modifiable('alice');

    updateUser('user:system:alice', changes({ password: 'Str0ng!Passw0rd' }));

    expect(vi.mocked(changePassword)).toHaveBeenCalledWith({
      userKey: 'user:system:alice',
      password: 'Str0ng!Passw0rd',
    });
  });

  it('clears the password on an empty string, and only then', () => {
    modifiable('alice');

    updateUser('user:system:alice', changes({ password: '' }));

    expect(vi.mocked(changePassword)).toHaveBeenCalledWith({
      userKey: 'user:system:alice',
      password: null,
    });
  });

  it('applies exactly the roles and groups it was told moved', () => {
    modifiable('alice');

    updateUser(
      'user:system:alice',
      changes({
        addRoles: ['role:cms.expert'],
        removeRoles: ['role:cms.admin'],
        addGroups: ['group:system:editors'],
        removeGroups: ['group:system:ops'],
      }),
    );

    expect(vi.mocked(addMembers)).toHaveBeenCalledWith('role:cms.expert', ['user:system:alice']);
    expect(vi.mocked(removeMembers)).toHaveBeenCalledWith('role:cms.admin', ['user:system:alice']);
    expect(vi.mocked(addMembers)).toHaveBeenCalledWith('group:system:editors', [
      'user:system:alice',
    ]);
    expect(vi.mocked(removeMembers)).toHaveBeenCalledWith('group:system:ops', [
      'user:system:alice',
    ]);
  });

  it('sets the password before touching the profile, so a rejected profile cannot swallow it', () => {
    const order: string[] = [];
    vi.mocked(getPrincipal).mockReturnValue(user('alice', 'Alice'));
    vi.mocked(changePassword).mockImplementation(() => {
      order.push('password');
    });
    vi.mocked(modifyUser).mockImplementation(() => {
      order.push('profile');
      throw new Error('Email address is already in use');
    });

    expect(() => updateUser('user:system:alice', changes({ password: 'Str0ng!Passw0rd' }))).toThrow(
      'Email address is already in use',
    );
    expect(order).toEqual(['password', 'profile']);
  });

  it('refuses a user that is gone without writing anything', () => {
    vi.mocked(getPrincipal).mockReturnValue(null);

    expect(() =>
      updateUser(
        'user:system:gone',
        changes({ password: 'Str0ng!Passw0rd', addRoles: ['role:cms.admin'] }),
      ),
    ).toThrow('No user answers to [user:system:gone]');

    expect(vi.mocked(changePassword)).not.toHaveBeenCalled();
    expect(vi.mocked(addMembers)).not.toHaveBeenCalled();
    expect(vi.mocked(modifyUser)).not.toHaveBeenCalled();
  });

  it('fails when the platform loses the user between the guard and the write', () => {
    vi.mocked(getPrincipal).mockReturnValue(user('alice', 'Alice'));
    vi.mocked(modifyUser).mockReturnValue(null);

    expect(() => updateUser('user:system:alice', changes())).toThrow(
      'No user answers to [user:system:alice]',
    );
  });
});

describe('addPublicKey', () => {
  function stored(...keys: { kid: string }[]) {
    vi.mocked(generateKid).mockReturnValue('abc123');
    vi.mocked(modifyProfile).mockImplementation(({ editor }) =>
      editor({ publicKeys: keys } as never),
    );
  }

  it('stores the key under the id the bean computed, with a timestamp', () => {
    stored();

    const written = addPublicKey('user:system:alice', '-----BEGIN PUBLIC KEY-----abc', 'Laptop');

    expect(written.kid).toBe('abc123');
    expect(written.label).toBe('Laptop');
    expect(written.publicKey).toBe('-----BEGIN PUBLIC KEY-----abc');
    expect(written.creationTime).toBeDefined();
  });

  it('keeps the keys already stored', () => {
    stored({ kid: 'other' });

    addPublicKey('user:system:alice', 'pem');

    const profile = vi.mocked(modifyProfile).mock.results[0]?.value as {
      publicKeys: { kid: string }[];
    };
    expect(profile.publicKeys.map(({ kid }) => kid)).toEqual(['other', 'abc123']);
  });

  it('refuses a key already stored under the same id', () => {
    stored({ kid: 'abc123' });

    expect(() => addPublicKey('user:system:alice', 'pem')).toThrow(
      'A public key with id [abc123] is already stored for [user:system:alice]',
    );
  });

  it('reads a profile holding exactly one key', () => {
    vi.mocked(generateKid).mockReturnValue('abc123');
    vi.mocked(modifyProfile).mockImplementation(({ editor }) =>
      editor({ publicKeys: { kid: 'only' } } as never),
    );

    addPublicKey('user:system:alice', 'pem');

    const profile = vi.mocked(modifyProfile).mock.results[0]?.value as {
      publicKeys: { kid: string }[];
    };
    expect(profile.publicKeys.map(({ kid }) => kid)).toEqual(['only', 'abc123']);
  });
});

describe('removePublicKey', () => {
  it('drops the key the id names and answers true', () => {
    vi.mocked(modifyProfile).mockImplementation(({ editor }) =>
      editor({ publicKeys: [{ kid: 'gone' }, { kid: 'kept' }] } as never),
    );

    expect(removePublicKey('user:system:alice', 'gone')).toBe(true);

    const profile = vi.mocked(modifyProfile).mock.results[0]?.value as {
      publicKeys: { kid: string }[];
    };
    expect(profile.publicKeys.map(({ kid }) => kid)).toEqual(['kept']);
  });

  it('answers true for an id nothing answers to', () => {
    vi.mocked(modifyProfile).mockImplementation(({ editor }) =>
      editor({ publicKeys: [{ kid: 'kept' }] } as never),
    );

    expect(removePublicKey('user:system:alice', 'never-stored')).toBe(true);
  });
});

describe('password arguments', () => {
  function providers(): void {
    vi.mocked(getIdProviders).mockReturnValue([
      { key: 'system', displayName: 'system' } as IdProvider,
    ]);
  }

  it('reads an explicit null as "leave the password alone", not as a value', () => {
    providers();
    vi.mocked(createUserPrincipal).mockReturnValue(user('alice', 'Alice'));

    createUser('system', 'alice', {
      displayName: 'Alice',
      password: null as unknown as string,
      roles: [],
      groups: [],
    });

    expect(vi.mocked(changePassword)).not.toHaveBeenCalled();

    vi.mocked(getPrincipal).mockReturnValue(user('alice', 'Alice'));
    vi.mocked(modifyUser).mockImplementation(({ editor }) => editor(user('alice', 'Alice')));

    updateUser('user:system:alice', {
      displayName: 'Alice',
      password: null as unknown as string,
      addRoles: [],
      removeRoles: [],
      addGroups: [],
      removeGroups: [],
    });

    expect(vi.mocked(changePassword)).not.toHaveBeenCalled();
  });

  // ! Nothing wraps the principal, the password and the memberships in a transaction, so a refusal that
  // ! arrives after the first write cannot be undone: creating first would leave a passwordless user
  // ! behind under a name the retry can no longer use. Asserting on the writes is the whole point of the
  // ! test — `changePassword` alone would pass with the checks in either order.
  it('refuses whitespace in a password, on both writes, before anything is written', () => {
    providers();
    vi.mocked(createUserPrincipal).mockReturnValue(user('alice', 'Alice'));
    vi.mocked(getPrincipal).mockReturnValue(user('alice', 'Alice'));

    expect(() =>
      createUser('system', 'alice', {
        displayName: 'Alice',
        password: 'My Pass 1!',
        roles: ['role:system.admin'],
        groups: [],
      }),
    ).toThrow('A password cannot contain whitespace');

    expect(vi.mocked(createUserPrincipal)).not.toHaveBeenCalled();

    expect(() =>
      updateUser('user:system:alice', {
        displayName: 'Alice',
        password: '   ',
        addRoles: ['role:system.admin'],
        removeRoles: [],
        addGroups: [],
        removeGroups: [],
      }),
    ).toThrow('A password cannot contain whitespace');

    expect(vi.mocked(modifyUser)).not.toHaveBeenCalled();
    expect(vi.mocked(changePassword)).not.toHaveBeenCalled();
    expect(vi.mocked(addMembers)).not.toHaveBeenCalled();
  });
});
