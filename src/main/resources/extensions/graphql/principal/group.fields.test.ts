import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./group.source', () => ({
  createGroup: vi.fn(),
  updateGroup: vi.fn(),
  getGroup: vi.fn(),
  listGroups: vi.fn(),
}));

import { groupMutationFields } from './group.fields';
import { createGroup, updateGroup } from './group.source';

function resolve(field: 'createGroup' | 'updateGroup', args: Record<string, unknown>): unknown {
  return groupMutationFields[field]?.resolve?.({
    source: undefined,
    args,
    context: undefined,
  } as never);
}

afterEach(() => {
  vi.clearAllMocks();
});

// The parser is tested on its own; this is the wiring — every list goes through it before the source.
describe('createGroup', () => {
  it('hands the source the parsed lists, defaulting the ones that did not arrive', () => {
    resolve('createGroup', {
      idProvider: 'system',
      name: 'editors',
      displayName: 'Editors',
      members: ['user:system:alice', 'group:system:writers'],
    });

    expect(vi.mocked(createGroup)).toHaveBeenCalledWith('system', 'editors', {
      displayName: 'Editors',
      description: undefined,
      members: ['user:system:alice', 'group:system:writers'],
      roles: [],
    });
  });

  it('refuses a group key in the roles list before the source sees it', () => {
    expect(() =>
      resolve('createGroup', {
        idProvider: 'system',
        name: 'editors',
        displayName: 'Editors',
        roles: ['group:remote:staff'],
      }),
    ).toThrow('Not a role key: [group:remote:staff]');

    expect(vi.mocked(createGroup)).not.toHaveBeenCalled();
  });

  it('refuses a role among the members', () => {
    expect(() =>
      resolve('createGroup', {
        idProvider: 'system',
        name: 'editors',
        displayName: 'Editors',
        members: ['role:cms.admin'],
      }),
    ).toThrow('Not a user or group key: [role:cms.admin]');

    expect(vi.mocked(createGroup)).not.toHaveBeenCalled();
  });
});

describe('updateGroup', () => {
  it('hands the source the parsed lists, defaulting the ones that did not arrive', () => {
    resolve('updateGroup', {
      key: 'group:system:editors',
      displayName: 'Editors',
      addRoles: ['role:cms.admin'],
      removeMembers: ['user:system:alice'],
    });

    expect(vi.mocked(updateGroup)).toHaveBeenCalledWith('group:system:editors', {
      displayName: 'Editors',
      description: undefined,
      addMembers: [],
      removeMembers: ['user:system:alice'],
      addRoles: ['role:cms.admin'],
      removeRoles: [],
    });
  });

  it.each(['addRoles', 'removeRoles'])(
    'refuses a group key in %s before the source sees it',
    (list) => {
      expect(() =>
        resolve('updateGroup', {
          key: 'group:system:editors',
          displayName: 'Editors',
          [list]: ['group:remote:staff'],
        }),
      ).toThrow('Not a role key: [group:remote:staff]');

      expect(vi.mocked(updateGroup)).not.toHaveBeenCalled();
    },
  );

  it.each(['addMembers', 'removeMembers'])('refuses a role in %s', (list) => {
    expect(() =>
      resolve('updateGroup', {
        key: 'group:system:editors',
        displayName: 'Editors',
        [list]: ['role:cms.admin'],
      }),
    ).toThrow('Not a user or group key: [role:cms.admin]');

    expect(vi.mocked(updateGroup)).not.toHaveBeenCalled();
  });
});
