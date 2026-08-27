import { errAsync, okAsync } from 'neverthrow';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '../../../shared/api';
import { sendUserCreation, sendUserUpdate } from '../api/users.api';
import type { PrincipalKey, User } from './principal.types';
import { createUser, updateUser, type UserDraft, type UserEdit } from './user-commands';

vi.mock('../api/users.api', () => ({
  sendUserCreation: vi.fn(),
  sendUserUpdate: vi.fn(),
}));

const written: User = {
  type: 'user',
  key: 'user:system:alice',
  displayName: 'Alice',
  login: 'alice',
  idProvider: 'system',
  hasPassword: true,
};

function draft(overrides: Partial<UserDraft> = {}): UserDraft {
  return {
    idProvider: 'system',
    name: 'alice',
    displayName: 'Alice',
    email: 'alice@example.com',
    roles: [],
    groups: [],
    ...overrides,
  };
}

function edit(overrides: Partial<UserEdit> = {}): UserEdit {
  return {
    displayName: 'Alice',
    email: 'alice@example.com',
    addRoles: [],
    removeRoles: [],
    addGroups: [],
    removeGroups: [],
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(sendUserCreation).mockReset();
  vi.mocked(sendUserCreation).mockReturnValue(okAsync(written));
  vi.mocked(sendUserUpdate).mockReset();
  vi.mocked(sendUserUpdate).mockReturnValue(okAsync(written));
});

describe('createUser', () => {
  it('sends the provider and the name apart from the scalars', async () => {
    await createUser(draft());

    expect(sendUserCreation).toHaveBeenCalledWith('system', 'alice', {
      displayName: 'Alice',
      email: 'alice@example.com',
      password: undefined,
      roles: [],
      groups: [],
    });
  });

  it('trims what the user typed', async () => {
    await createUser(draft({ name: '  alice  ', displayName: '  Alice  ', email: ' a@b.co ' }));

    expect(sendUserCreation).toHaveBeenCalledWith(
      'system',
      'alice',
      expect.objectContaining({ displayName: 'Alice', email: 'a@b.co' }),
    );
  });

  it('reports an email of nothing but spaces as absent', async () => {
    await createUser(draft({ email: '   ' }));

    expect(sendUserCreation).toHaveBeenCalledWith(
      'system',
      'alice',
      expect.objectContaining({ email: undefined }),
    );
  });

  it('carries a password when one was staged', async () => {
    await createUser(draft({ password: 'Str0ng!Passw0rd' }));

    expect(sendUserCreation).toHaveBeenCalledWith(
      'system',
      'alice',
      expect.objectContaining({ password: 'Str0ng!Passw0rd' }),
    );
  });

  it('answers the user that was written', async () => {
    expect((await createUser(draft()))._unsafeUnwrap()).toBe(written);
  });

  it('hands a rejection back instead of notifying', async () => {
    vi.mocked(sendUserCreation).mockReturnValue(errAsync(new AppError('Email already in use')));

    expect((await createUser(draft()))._unsafeUnwrapErr().message).toBe('Email already in use');
  });
});

describe('updateUser', () => {
  it('writes against the key it was given', async () => {
    await updateUser('user:system:alice' as PrincipalKey, edit());

    expect(sendUserUpdate).toHaveBeenCalledWith('user:system:alice', {
      displayName: 'Alice',
      email: 'alice@example.com',
      password: undefined,
      addRoles: [],
      removeRoles: [],
      addGroups: [],
      removeGroups: [],
    });
  });

  it('passes an absent password through as absent, and an empty one through as empty', async () => {
    await updateUser('user:system:alice' as PrincipalKey, edit());
    expect(sendUserUpdate).toHaveBeenLastCalledWith(
      'user:system:alice',
      expect.objectContaining({ password: undefined }),
    );

    await updateUser('user:system:alice' as PrincipalKey, edit({ password: '' }));
    expect(sendUserUpdate).toHaveBeenLastCalledWith(
      'user:system:alice',
      expect.objectContaining({ password: '' }),
    );
  });

  it('passes the four change lists through untouched', async () => {
    const addRoles = ['role:cms.expert'] as PrincipalKey[];
    const removeRoles = ['role:cms.admin'] as PrincipalKey[];
    const addGroups = ['group:system:editors'] as PrincipalKey[];
    const removeGroups = ['group:system:ops'] as PrincipalKey[];

    await updateUser(
      'user:system:alice' as PrincipalKey,
      edit({ addRoles, removeRoles, addGroups, removeGroups }),
    );

    expect(sendUserUpdate).toHaveBeenCalledWith(
      'user:system:alice',
      expect.objectContaining({ addRoles, removeRoles, addGroups, removeGroups }),
    );
  });
});
