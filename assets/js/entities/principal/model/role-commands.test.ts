import { errAsync, okAsync } from 'neverthrow';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '../../../shared/api';
import { sendRoleCreation, sendRoleUpdate } from '../api/roles.api';
import type { PrincipalKey, Role } from './principal.types';
import { createRole, updateRole, type RoleDraft, type RoleEdit } from './role-commands';

vi.mock('../api/roles.api', () => ({
  sendRoleCreation: vi.fn(),
  sendRoleUpdate: vi.fn(),
}));

const written: Role = { type: 'role', key: 'role:editors', displayName: 'Editors' };

function draft(overrides: Partial<RoleDraft> = {}): RoleDraft {
  return { name: 'editors', displayName: 'Editors', description: '', members: [], ...overrides };
}

beforeEach(() => {
  vi.mocked(sendRoleCreation).mockReset();
  vi.mocked(sendRoleCreation).mockReturnValue(okAsync(written));
  vi.mocked(sendRoleUpdate).mockReset();
  vi.mocked(sendRoleUpdate).mockReturnValue(okAsync(written));
});

describe('createRole', () => {
  it('sends the name apart from the scalars, since only a new role carries one', async () => {
    await createRole(draft({ description: 'Edits things' }));

    expect(sendRoleCreation).toHaveBeenCalledWith('editors', {
      displayName: 'Editors',
      description: 'Edits things',
      members: [],
    });
  });

  it('trims what the user typed', async () => {
    await createRole(draft({ name: '  editors  ', displayName: '  Editors  ' }));

    expect(sendRoleCreation).toHaveBeenCalledWith(
      'editors',
      expect.objectContaining({ displayName: 'Editors' }),
    );
  });

  it('reports a description of nothing but spaces as absent', async () => {
    await createRole(draft({ description: '   ' }));

    expect(sendRoleCreation).toHaveBeenCalledWith(
      'editors',
      expect.objectContaining({ description: undefined }),
    );
  });

  it('carries the member keys as the whole list the role is to hold', async () => {
    const members = ['user:system:su', 'group:system:ops'] as PrincipalKey[];

    await createRole(draft({ members }));

    expect(sendRoleCreation).toHaveBeenCalledWith('editors', expect.objectContaining({ members }));
  });

  it('answers the role that was written', async () => {
    expect((await createRole(draft()))._unsafeUnwrap()).toBe(written);
  });

  // ! The dialog stays open and shows this, so the command must hand the failure back rather than
  // ! reporting it itself.
  it('hands a rejection back instead of notifying', async () => {
    vi.mocked(sendRoleCreation).mockReturnValue(errAsync(new AppError('Role already exists')));

    const result = await createRole(draft());

    expect(result._unsafeUnwrapErr().message).toBe('Role already exists');
  });
});

describe('updateRole', () => {
  function edit(overrides: Partial<RoleEdit> = {}): RoleEdit {
    return {
      displayName: 'Editors',
      description: '',
      addMembers: [],
      removeMembers: [],
      ...overrides,
    };
  }

  it('writes against the key it was given, never the typed name', async () => {
    await updateRole('role:system.admin' as PrincipalKey, edit());

    expect(sendRoleUpdate).toHaveBeenCalledWith('role:system.admin', {
      displayName: 'Editors',
      description: undefined,
      addMembers: [],
      removeMembers: [],
    });
  });

  it('passes the two change lists through untouched', async () => {
    const addMembers = ['group:system:writers'] as PrincipalKey[];
    const removeMembers = ['group:system:ops'] as PrincipalKey[];

    await updateRole('role:editors' as PrincipalKey, edit({ addMembers, removeMembers }));

    expect(sendRoleUpdate).toHaveBeenCalledWith(
      'role:editors',
      expect.objectContaining({ addMembers, removeMembers }),
    );
  });
});
