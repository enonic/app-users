import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./user.source', () => ({
  createUser: vi.fn(),
  updateUser: vi.fn(),
  addPublicKey: vi.fn(),
  removePublicKey: vi.fn(),
  findUserByEmail: vi.fn(),
  getUser: vi.fn(),
  listUsers: vi.fn(),
}));

import { userMutationFields } from './user.fields';
import { createUser, updateUser } from './user.source';

function resolve(field: 'createUser' | 'updateUser', args: Record<string, unknown>): unknown {
  return userMutationFields[field]?.resolve?.({
    source: undefined,
    args,
    context: undefined,
  } as never);
}

afterEach(() => {
  vi.clearAllMocks();
});

// The parser is tested on its own; this is the wiring — every list goes through it before the source.
describe('createUser', () => {
  it('hands the source the parsed lists, defaulting the ones that did not arrive', () => {
    resolve('createUser', {
      idProvider: 'system',
      name: 'alice',
      displayName: 'Alice',
      roles: ['role:cms.admin'],
    });

    expect(vi.mocked(createUser)).toHaveBeenCalledWith('system', 'alice', {
      displayName: 'Alice',
      email: undefined,
      password: undefined,
      roles: ['role:cms.admin'],
      groups: [],
    });
  });

  it('refuses a group key in the roles list before the source sees it', () => {
    expect(() =>
      resolve('createUser', {
        idProvider: 'system',
        name: 'alice',
        displayName: 'Alice',
        roles: ['group:remote:staff'],
      }),
    ).toThrow('Not a role key: [group:remote:staff]');

    expect(vi.mocked(createUser)).not.toHaveBeenCalled();
  });

  it('refuses a role key in the groups list the same way', () => {
    expect(() =>
      resolve('createUser', {
        idProvider: 'system',
        name: 'alice',
        displayName: 'Alice',
        groups: ['role:cms.admin'],
      }),
    ).toThrow('Not a group key: [role:cms.admin]');

    expect(vi.mocked(createUser)).not.toHaveBeenCalled();
  });
});

describe('updateUser', () => {
  it('hands the source the parsed lists, defaulting the ones that did not arrive', () => {
    resolve('updateUser', {
      key: 'user:system:alice',
      displayName: 'Alice',
      removeRoles: ['role:cms.admin'],
      addGroups: ['group:system:editors'],
    });

    expect(vi.mocked(updateUser)).toHaveBeenCalledWith('user:system:alice', {
      displayName: 'Alice',
      email: undefined,
      password: undefined,
      addRoles: [],
      removeRoles: ['role:cms.admin'],
      addGroups: ['group:system:editors'],
      removeGroups: [],
    });
  });

  it.each(['addRoles', 'removeRoles'])(
    'refuses a group key in %s before the source sees it',
    (list) => {
      expect(() =>
        resolve('updateUser', {
          key: 'user:system:alice',
          displayName: 'Alice',
          [list]: ['group:remote:staff'],
        }),
      ).toThrow('Not a role key: [group:remote:staff]');

      expect(vi.mocked(updateUser)).not.toHaveBeenCalled();
    },
  );

  it.each(['addGroups', 'removeGroups'])('refuses a user key in %s', (list) => {
    expect(() =>
      resolve('updateUser', {
        key: 'user:system:alice',
        displayName: 'Alice',
        [list]: ['user:system:bob'],
      }),
    ).toThrow('Not a group key: [user:system:bob]');

    expect(vi.mocked(updateUser)).not.toHaveBeenCalled();
  });
});
