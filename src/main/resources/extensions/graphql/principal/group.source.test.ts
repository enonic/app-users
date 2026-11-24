import { getIdProvider, getIdProviderDescriptor } from '/lib/idprovider';
import {
  addMembers,
  createGroup as createGroupPrincipal,
  findPrincipals,
  getMembers,
  getMemberships,
  getPrincipal,
  type Group,
  hasRole,
  modifyGroup,
  removeMembers,
  type Role,
  type User,
} from '/lib/xp/auth';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createGroup,
  getGroup,
  listGroupMembers,
  listGroupGroups,
  listGroupRoles,
  listGroups,
  updateGroup,
  type GroupChanges,
  type GroupInput,
} from './group.source';

function group(key: string, displayName: string): Group {
  return {
    type: 'group',
    key: key as Group['key'],
    displayName,
    modifiedTime: '2026-08-01T10:00:00Z',
  };
}

function user(key: string, displayName: string): User {
  return {
    type: 'user',
    key: key as User['key'],
    displayName,
    login: displayName,
    idProvider: 'system',
    hasPassword: true,
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

type LibIdProvider = NonNullable<ReturnType<typeof getIdProvider>>;

// The guards read one provider at a time, so the store is a lookup rather than a list.
function providerStore(providers: readonly LibIdProvider[]): void {
  vi.mocked(getIdProvider).mockImplementation(
    ({ idProvider }) => providers.find(({ key }) => key === idProvider) ?? null,
  );
}

function localProvider(key: string): LibIdProvider {
  return { key, displayName: key };
}

function remoteProvider(key: string): LibIdProvider {
  return {
    key,
    displayName: key,
    idProviderConfig: { applicationKey: 'com.example.remote', config: [] },
  };
}

function found(hits: Group[]) {
  return { total: hits.length, count: hits.length, hits };
}

// An administrator unless a test says otherwise: what only one may do has its own describe below.
beforeEach(() => {
  vi.mocked(hasRole).mockReturnValue(true);
});

// The platform as a store. A principal named answers to its key in any case, as XP finds a node by a
// path in any case and answers with the node's own key; every other key answers as itself.
function stored(...principals: (User | Group | Role)[]): void {
  vi.mocked(getPrincipal).mockImplementation(
    (key) =>
      principals.find((principal) => principal.key.toLowerCase() === key.toLowerCase()) ??
      itself(key),
  );
}

function itself(key: string): User | Group | Role {
  if (key.startsWith('role:')) {
    return role(key, key);
  }

  return key.startsWith('group:') ? group(key, 'Whatever') : user(key, key);
}

beforeEach(() => {
  stored();
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('listGroups', () => {
  it('asks for every group rather than the default first ten', () => {
    vi.mocked(findPrincipals).mockReturnValue(found([]));

    listGroups();

    expect(vi.mocked(findPrincipals)).toHaveBeenCalledWith({ type: 'group', count: -1 });
  });

  it('sorts by display name, ignoring case', () => {
    vi.mocked(findPrincipals).mockReturnValue(
      found([
        group('group:system:c', 'contributors'),
        group('group:system:a', 'Administrators'),
        group('group:system:b', 'Backup'),
      ]),
    );

    expect(listGroups().map(({ key }) => key)).toEqual([
      'group:system:a',
      'group:system:b',
      'group:system:c',
    ]);
  });

  it('drops a hit that is not a group, whatever the query asked for', () => {
    const hits = [
      group('group:system:a', 'Admins'),
      user('user:system:su', 'Super User') as unknown as Group,
    ];
    vi.mocked(findPrincipals).mockReturnValue(found(hits));

    expect(listGroups().map(({ key }) => key)).toEqual(['group:system:a']);
  });

  it('answers an empty list on an instance with no groups', () => {
    vi.mocked(findPrincipals).mockReturnValue(found([]));

    expect(listGroups()).toEqual([]);
  });
});

describe('getGroup', () => {
  it('answers the group a key names', () => {
    const ops = group('group:system:ops', 'Ops');
    vi.mocked(getPrincipal).mockReturnValue(ops);

    expect(getGroup('group:system:ops')).toBe(ops);
    expect(vi.mocked(getPrincipal)).toHaveBeenCalledWith('group:system:ops');
  });

  // A group key carries its provider, so the two-segment form a role uses is not one.
  it('answers null for a key naming no group, without asking', () => {
    expect(getGroup('role:system.admin')).toBeNull();
    expect(getGroup('group:ops')).toBeNull();
    expect(getGroup('')).toBeNull();
    expect(vi.mocked(getPrincipal)).not.toHaveBeenCalled();
  });

  it('answers null when the key names something that is not a group', () => {
    vi.mocked(getPrincipal).mockReturnValue(user('user:system:su', 'Super User'));

    expect(getGroup('group:system:su')).toBeNull();
  });

  it('answers null for a group nothing answers to', () => {
    vi.mocked(getPrincipal).mockReturnValue(null);

    expect(getGroup('group:system:gone')).toBeNull();
  });

  it('answers null when the platform refuses the key', () => {
    vi.mocked(getPrincipal).mockImplementation(() => {
      throw new Error('Invalid group key');
    });

    expect(getGroup('group:system:not valid')).toBeNull();
  });
});

describe('listGroupMembers', () => {
  it('reads the members of the group it was asked for', () => {
    vi.mocked(getMembers).mockReturnValue([]);

    listGroupMembers('group:system:admins');

    expect(vi.mocked(getMembers)).toHaveBeenCalledWith('group:system:admins');
  });

  it('keeps users and nested groups in one flat list, sorted by display name', () => {
    vi.mocked(getMembers).mockReturnValue([
      user('user:system:zoe', 'Zoe'),
      group('group:system:editors', 'Editors'),
    ]);

    expect(listGroupMembers('group:system:admins')).toEqual([
      { key: 'group:system:editors', type: 'group', displayName: 'Editors' },
      { key: 'user:system:zoe', type: 'user', displayName: 'Zoe' },
    ]);
  });

  it('answers an empty list for a group nobody is in', () => {
    vi.mocked(getMembers).mockReturnValue([]);

    expect(listGroupMembers('group:system:admins')).toEqual([]);
  });
});

describe('listGroupRoles and listGroupGroups', () => {
  it('passes the caller through to the platform, both ways', () => {
    vi.mocked(getMemberships).mockReturnValue([]);

    listGroupRoles('group:system:admins', true);
    expect(vi.mocked(getMemberships)).toHaveBeenCalledWith('group:system:admins', true);

    listGroupGroups('group:system:admins', false);
    expect(vi.mocked(getMemberships)).toHaveBeenCalledWith('group:system:admins', false);
  });

  it('splits the memberships by type', () => {
    vi.mocked(getMemberships).mockReturnValue([
      role('role:system.admin', 'Administrator'),
      group('group:system:staff', 'Staff'),
    ]);

    expect(listGroupRoles('group:system:admins', false)).toEqual([
      { key: 'role:system.admin', type: 'role', displayName: 'Administrator' },
    ]);
    expect(listGroupGroups('group:system:admins', false)).toEqual([
      { key: 'group:system:staff', type: 'group', displayName: 'Staff' },
    ]);
  });

  it('sorts by display name, ignoring case', () => {
    vi.mocked(getMemberships).mockReturnValue([
      role('role:b', 'browser'),
      role('role:a', 'Administrator'),
    ]);

    expect(listGroupRoles('group:system:admins', false).map(({ key }) => key)).toEqual([
      'role:a',
      'role:b',
    ]);
  });

  it('answers an empty list for a group holding no role', () => {
    vi.mocked(getMemberships).mockReturnValue([group('group:system:staff', 'Staff')]);

    expect(listGroupRoles('group:system:admins', false)).toEqual([]);
  });
});

describe('createGroup', () => {
  function input(overrides: Partial<GroupInput> = {}): GroupInput {
    return { displayName: 'Managers', members: [], roles: [], ...overrides };
  }

  function providers(...keys: string[]): void {
    providerStore(keys.map(localProvider));
  }

  it('creates the group in the provider named, from the scalars given', () => {
    providers('store');
    vi.mocked(createGroupPrincipal).mockReturnValue(group('group:store:managers', 'Managers'));

    createGroup('store', 'managers', input({ description: 'Runs the shops' }));

    expect(vi.mocked(createGroupPrincipal)).toHaveBeenCalledWith({
      idProvider: 'store',
      name: 'managers',
      displayName: 'Managers',
      description: 'Runs the shops',
    });
  });

  it('gives the new group every member and every role listed', () => {
    providers('store');
    vi.mocked(createGroupPrincipal).mockReturnValue(group('group:store:managers', 'Managers'));

    createGroup(
      'store',
      'managers',
      input({ members: ['user:store:alice'], roles: ['role:cms.admin'] }),
    );

    expect(vi.mocked(addMembers)).toHaveBeenCalledWith('group:store:managers', [
      'user:store:alice',
    ]);
    expect(vi.mocked(addMembers)).toHaveBeenCalledWith('role:cms.admin', ['group:store:managers']);
  });

  it('touches no relationship for a group created empty', () => {
    providers('store');
    vi.mocked(createGroupPrincipal).mockReturnValue(group('group:store:managers', 'Managers'));

    createGroup('store', 'managers', input());

    expect(vi.mocked(addMembers)).not.toHaveBeenCalled();
    expect(vi.mocked(removeMembers)).not.toHaveBeenCalled();
  });

  it('refuses a provider that no longer exists, without creating anything', () => {
    providers('system');

    expect(() => createGroup('gone', 'managers', input())).toThrow(
      'No ID provider answers to [gone]',
    );
    expect(vi.mocked(createGroupPrincipal)).not.toHaveBeenCalled();
  });

  it('answers the group the platform created', () => {
    providers('store');
    const made = group('group:store:managers', 'Managers');
    vi.mocked(createGroupPrincipal).mockReturnValue(made);

    expect(createGroup('store', 'managers', input())).toBe(made);
  });
});

describe('updateGroup', () => {
  beforeEach(() => {
    providerStore([localProvider('store'), remoteProvider('remote')]);
    vi.mocked(getIdProviderDescriptor).mockReturnValue({ mode: 'EXTERNAL', hasConfig: false });
  });

  function changes(overrides: Partial<GroupChanges> = {}): GroupChanges {
    return {
      displayName: 'Managers',
      addMembers: [],
      removeMembers: [],
      addRoles: [],
      removeRoles: [],
      ...overrides,
    };
  }

  function modifiable(key: string) {
    vi.mocked(modifyGroup).mockImplementation(({ editor }) =>
      editor({ ...group(key, 'Whatever'), description: 'Before' }),
    );
  }

  it('writes the scalars through the editor the platform hands it', () => {
    modifiable('group:store:managers');

    const updated = updateGroup(
      'group:store:managers',
      changes({ displayName: 'Store managers', description: 'After' }),
    );

    expect(updated.displayName).toBe('Store managers');
    expect(updated.description).toBe('After');
  });

  it('clears a description the edit dropped, with an empty string rather than nothing', () => {
    modifiable('group:store:managers');

    expect(updateGroup('group:store:managers', changes()).description).toBe('');
  });

  it('reads no membership at all when neither list moved', () => {
    modifiable('group:store:managers');

    updateGroup('group:store:managers', changes({ description: 'Just the description' }));

    expect(vi.mocked(getMembers)).not.toHaveBeenCalled();
    expect(vi.mocked(getMemberships)).not.toHaveBeenCalled();
    expect(vi.mocked(addMembers)).not.toHaveBeenCalled();
    expect(vi.mocked(removeMembers)).not.toHaveBeenCalled();
  });

  it('applies exactly the members it was told moved, in one call each way', () => {
    modifiable('group:store:managers');

    updateGroup(
      'group:store:managers',
      changes({ addMembers: ['user:store:bob'], removeMembers: ['group:store:staff'] }),
    );

    expect(vi.mocked(addMembers)).toHaveBeenCalledWith('group:store:managers', ['user:store:bob']);
    expect(vi.mocked(removeMembers)).toHaveBeenCalledWith('group:store:managers', [
      'group:store:staff',
    ]);
  });

  it('applies a role change against the role, one call per role', () => {
    modifiable('group:store:managers');

    updateGroup(
      'group:store:managers',
      changes({ addRoles: ['role:cms.expert'], removeRoles: ['role:cms.admin'] }),
    );

    expect(vi.mocked(addMembers)).toHaveBeenCalledWith('role:cms.expert', ['group:store:managers']);
    expect(vi.mocked(removeMembers)).toHaveBeenCalledWith('role:cms.admin', [
      'group:store:managers',
    ]);
  });

  it('cannot touch a membership the edit did not name', () => {
    modifiable('group:store:managers');

    updateGroup('group:store:managers', changes({ addRoles: ['role:cms.expert'] }));

    expect(vi.mocked(removeMembers)).not.toHaveBeenCalled();
  });

  it('adds a member under the key the platform keeps, and removes one as it was given', () => {
    stored(user('user:store:alice', 'Alice'));
    modifiable('group:store:managers');

    updateGroup(
      'group:store:managers',
      changes({ addMembers: ['user:STORE:Alice'], removeMembers: ['user:STORE:Bob'] }),
    );

    expect(vi.mocked(addMembers)).toHaveBeenCalledWith('group:store:managers', [
      'user:store:alice',
    ]);
    expect(vi.mocked(removeMembers)).toHaveBeenCalledWith('group:store:managers', [
      'user:STORE:Bob',
    ]);
  });

  it('refuses a role nothing answers to, before any write', () => {
    vi.mocked(getPrincipal).mockImplementation((key) =>
      key.startsWith('group:') ? group(key, 'Managers') : null,
    );

    expect(() =>
      updateGroup(
        'group:store:managers',
        changes({ displayName: 'Shop managers', addRoles: ['role:gone'] }),
      ),
    ).toThrow('No role answers to [role:gone]');
    expect(vi.mocked(modifyGroup)).not.toHaveBeenCalled();
  });

  it('fails for a group nothing answers to any more', () => {
    vi.mocked(modifyGroup).mockReturnValue(null);

    expect(() => updateGroup('group:store:gone', changes())).toThrow(
      'No group answers to [group:store:gone]',
    );
    expect(vi.mocked(addMembers)).not.toHaveBeenCalled();
  });
});

describe('writes a remote system owns', () => {
  beforeEach(() => {
    providerStore([remoteProvider('remote')]);
  });

  const noChanges = {
    displayName: 'Staff',
    addMembers: [],
    removeMembers: [],
    addRoles: [],
    removeRoles: [],
  };

  it('refuses to create a group in an EXTERNAL provider, before any write', () => {
    vi.mocked(getIdProviderDescriptor).mockReturnValue({ mode: 'EXTERNAL', hasConfig: false });

    expect(() =>
      createGroup('remote', 'staff', { displayName: 'Staff', members: [], roles: [] }),
    ).toThrow(/remote/);

    expect(vi.mocked(createGroupPrincipal)).not.toHaveBeenCalled();
  });

  it('refuses the fields and the members of a group of an EXTERNAL provider, before any write', () => {
    vi.mocked(getIdProviderDescriptor).mockReturnValue({ mode: 'EXTERNAL', hasConfig: false });
    stored(group('group:remote:staff', 'Staff'));

    expect(() =>
      updateGroup('group:remote:staff', { ...noChanges, addMembers: ['user:system:alice'] }),
    ).toThrow(/remote/);
    expect(() =>
      updateGroup('group:remote:staff', { ...noChanges, displayName: 'Remote staff' }),
    ).toThrow(/remote/);

    expect(vi.mocked(modifyGroup)).not.toHaveBeenCalled();
    expect(vi.mocked(addMembers)).not.toHaveBeenCalled();
  });

  // Roles live on the role, where the Roles section writes them as well.
  it('reads whitespace around a stored value as no change, since the client trims what it sends', () => {
    vi.mocked(getIdProviderDescriptor).mockReturnValue({ mode: 'EXTERNAL', hasConfig: false });
    stored({
      ...group('group:remote:staff', 'Staff '),
      description: 'Remote staff\n',
    });

    updateGroup('group:remote:staff', {
      ...noChanges,
      description: 'Remote staff',
      addRoles: ['role:cms.admin'],
    });

    expect(vi.mocked(addMembers)).toHaveBeenCalledWith('role:cms.admin', ['group:remote:staff']);
    expect(vi.mocked(modifyGroup)).not.toHaveBeenCalled();
  });

  it('lets a group of an EXTERNAL provider join and leave roles', () => {
    vi.mocked(getIdProviderDescriptor).mockReturnValue({ mode: 'EXTERNAL', hasConfig: false });
    stored(group('group:remote:staff', 'Staff'));

    updateGroup('group:remote:staff', {
      ...noChanges,
      addRoles: ['role:cms.admin'],
      removeRoles: ['role:cms.expert'],
    });

    expect(vi.mocked(addMembers)).toHaveBeenCalledWith('role:cms.admin', ['group:remote:staff']);
    expect(vi.mocked(removeMembers)).toHaveBeenCalledWith('role:cms.expert', [
      'group:remote:staff',
    ]);
    expect(vi.mocked(modifyGroup)).not.toHaveBeenCalled();
  });

  it('lets a MIXED provider keep its groups local', () => {
    vi.mocked(getIdProviderDescriptor).mockReturnValue({ mode: 'MIXED', hasConfig: false });
    vi.mocked(createGroupPrincipal).mockReturnValue(group('group:remote:staff', 'Staff'));

    createGroup('remote', 'staff', { displayName: 'Staff', members: [], roles: [] });

    expect(vi.mocked(createGroupPrincipal)).toHaveBeenCalled();
  });
});

describe('a group that holds the administrator role, for a caller without it', () => {
  beforeEach(() => {
    providerStore([localProvider('store')]);
    vi.mocked(hasRole).mockImplementation((key) => key === 'role:system.user.admin');
    vi.mocked(getMembers).mockImplementation((key) =>
      key === 'role:system.admin' ? [group('group:store:ops', 'Ops')] : [],
    );
    vi.mocked(modifyGroup).mockImplementation(({ editor }) =>
      editor(group('group:store:ops', 'Ops')),
    );
  });

  function changes(overrides: Partial<GroupChanges> = {}): GroupChanges {
    return {
      displayName: 'Ops',
      addMembers: [],
      removeMembers: [],
      addRoles: [],
      removeRoles: [],
      ...overrides,
    };
  }

  it.each([
    { what: 'gains', change: { addMembers: ['user:store:mallory' as const] } },
    { what: 'loses', change: { removeMembers: ['user:store:alice' as const] } },
  ])('$what no member, and nothing is written at all', ({ change }) => {
    expect(() => updateGroup('group:store:ops', changes(change))).toThrow(
      'Members of [group:store:ops] can only be changed by an administrator',
    );
    expect(vi.mocked(modifyGroup)).not.toHaveBeenCalled();
    expect(vi.mocked(addMembers)).not.toHaveBeenCalled();
    expect(vi.mocked(removeMembers)).not.toHaveBeenCalled();
  });

  // ! XP finds a group and a role under any case of the key and refuses their members there, midway.
  it('knows the group and the role under keys spelled in another case', () => {
    stored(group('group:store:ops', 'Ops'), role('role:system.admin', 'Administrator'));

    expect(() =>
      updateGroup('group:STORE:Ops', changes({ addMembers: ['user:store:mallory'] })),
    ).toThrow('Members of [group:store:ops] can only be changed by an administrator');
    expect(() =>
      updateGroup(
        'group:store:staff',
        changes({ displayName: 'Staff', addRoles: ['role:SYSTEM.ADMIN'] }),
      ),
    ).toThrow('Members of [role:system.admin] can only be changed by an administrator');
    expect(() =>
      createGroup('store', 'staff', {
        displayName: 'Staff',
        members: [],
        roles: ['role:SYSTEM.ADMIN'],
      }),
    ).toThrow('Members of [role:system.admin] can only be changed by an administrator');

    expect(vi.mocked(createGroupPrincipal)).not.toHaveBeenCalled();
    expect(vi.mocked(modifyGroup)).not.toHaveBeenCalled();
    expect(vi.mocked(addMembers)).not.toHaveBeenCalled();
  });

  it('still takes a new display name and description', () => {
    updateGroup('group:store:ops', changes({ displayName: 'Operations', description: 'On call' }));

    expect(vi.mocked(modifyGroup)).toHaveBeenCalled();
  });

  it('still joins and leaves other roles', () => {
    updateGroup('group:store:ops', changes({ addRoles: ['role:editors'] }));

    expect(vi.mocked(addMembers)).toHaveBeenCalledWith('role:editors', ['group:store:ops']);
  });

  it('does not let another group into the administrator role, by an edit or at creation', () => {
    expect(() =>
      updateGroup('group:store:sales', changes({ addRoles: ['role:system.admin'] })),
    ).toThrow('Members of [role:system.admin] can only be changed by an administrator');
    expect(() =>
      createGroup('store', 'sales', {
        displayName: 'Sales',
        members: [],
        roles: ['role:system.admin'],
      }),
    ).toThrow('Members of [role:system.admin] can only be changed by an administrator');
    expect(vi.mocked(createGroupPrincipal)).not.toHaveBeenCalled();
    expect(vi.mocked(modifyGroup)).not.toHaveBeenCalled();
  });

  it('leaves the members of any other group open', () => {
    vi.mocked(modifyGroup).mockImplementation(({ editor }) =>
      editor(group('group:store:sales', 'Sales')),
    );

    updateGroup('group:store:sales', changes({ addMembers: ['user:store:alice'] }));

    expect(vi.mocked(addMembers)).toHaveBeenCalledWith('group:store:sales', ['user:store:alice']);
  });
});
