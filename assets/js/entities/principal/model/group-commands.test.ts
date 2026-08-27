import { errAsync, okAsync } from 'neverthrow';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '../../../shared/api';
import { sendGroupCreation, sendGroupUpdate } from '../api/groups.api';
import { createGroup, updateGroup, type GroupDraft, type GroupEdit } from './group-commands';
import type { Group, PrincipalKey } from './principal.types';

vi.mock('../api/groups.api', () => ({
  sendGroupCreation: vi.fn(),
  sendGroupUpdate: vi.fn(),
}));

const written: Group = {
  type: 'group',
  key: 'group:store:managers',
  displayName: 'Managers',
};

function draft(overrides: Partial<GroupDraft> = {}): GroupDraft {
  return {
    idProvider: 'store',
    name: 'managers',
    displayName: 'Managers',
    description: '',
    members: [],
    roles: [],
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(sendGroupCreation).mockReset();
  vi.mocked(sendGroupCreation).mockReturnValue(okAsync(written));
  vi.mocked(sendGroupUpdate).mockReset();
  vi.mocked(sendGroupUpdate).mockReturnValue(okAsync(written));
});

describe('createGroup', () => {
  it('sends the provider and the name apart from the scalars', async () => {
    await createGroup(draft({ description: 'Runs the shops' }));

    expect(sendGroupCreation).toHaveBeenCalledWith('store', 'managers', {
      displayName: 'Managers',
      description: 'Runs the shops',
      members: [],
      roles: [],
    });
  });

  it('trims what the user typed', async () => {
    await createGroup(draft({ name: '  managers  ', displayName: '  Managers  ' }));

    expect(sendGroupCreation).toHaveBeenCalledWith(
      'store',
      'managers',
      expect.objectContaining({ displayName: 'Managers' }),
    );
  });

  it('reports a description of nothing but spaces as absent', async () => {
    await createGroup(draft({ description: '   ' }));

    expect(sendGroupCreation).toHaveBeenCalledWith(
      'store',
      'managers',
      expect.objectContaining({ description: undefined }),
    );
  });

  it('carries the two lists whole and apart', async () => {
    const members = ['user:store:alice'] as PrincipalKey[];
    const roles = ['role:cms.admin'] as PrincipalKey[];

    await createGroup(draft({ members, roles }));

    expect(sendGroupCreation).toHaveBeenCalledWith(
      'store',
      'managers',
      expect.objectContaining({ members, roles }),
    );
  });

  it('answers the group that was written', async () => {
    expect((await createGroup(draft()))._unsafeUnwrap()).toBe(written);
  });

  // ! The dialog stays open and shows this, so the command must hand the failure back rather than
  // ! reporting it itself.
  it('hands a rejection back instead of notifying', async () => {
    vi.mocked(sendGroupCreation).mockReturnValue(errAsync(new AppError('Group already exists')));

    const result = await createGroup(draft());

    expect(result._unsafeUnwrapErr().message).toBe('Group already exists');
  });
});

describe('updateGroup', () => {
  function edit(overrides: Partial<GroupEdit> = {}): GroupEdit {
    return {
      displayName: 'Managers',
      description: '',
      addMembers: [],
      removeMembers: [],
      addRoles: [],
      removeRoles: [],
      ...overrides,
    };
  }

  it('writes against the key it was given', async () => {
    await updateGroup('group:store:managers' as PrincipalKey, edit());

    expect(sendGroupUpdate).toHaveBeenCalledWith('group:store:managers', {
      displayName: 'Managers',
      description: undefined,
      addMembers: [],
      removeMembers: [],
      addRoles: [],
      removeRoles: [],
    });
  });

  it('trims the scalars and reports a blank description as absent', async () => {
    await updateGroup(
      'group:store:managers' as PrincipalKey,
      edit({ displayName: '  Managers  ', description: '   ' }),
    );

    expect(sendGroupUpdate).toHaveBeenCalledWith(
      'group:store:managers',
      expect.objectContaining({ displayName: 'Managers', description: undefined }),
    );
  });

  it('passes the four change lists through untouched', async () => {
    const addMembers = ['user:store:bob'] as PrincipalKey[];
    const removeMembers = ['user:store:alice'] as PrincipalKey[];
    const addRoles = ['role:cms.expert'] as PrincipalKey[];
    const removeRoles = ['role:cms.admin'] as PrincipalKey[];

    await updateGroup(
      'group:store:managers' as PrincipalKey,
      edit({ addMembers, removeMembers, addRoles, removeRoles }),
    );

    expect(sendGroupUpdate).toHaveBeenCalledWith(
      'group:store:managers',
      expect.objectContaining({ addMembers, removeMembers, addRoles, removeRoles }),
    );
  });
});
