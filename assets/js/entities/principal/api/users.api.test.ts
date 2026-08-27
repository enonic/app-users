import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setGraphQlEndpoint } from '../../../shared/api';
import type { PrincipalKey } from '../model/principal.types';
import { fetchUserDetail, sendUserCreation, sendUserUpdate } from './users.api';

let sent: { query?: string; variables?: Record<string, unknown> } | undefined;

function respondWith(body: unknown): void {
  globalThis.fetch = vi.fn((_url: unknown, options?: { body?: string }) => {
    sent = JSON.parse(options?.body ?? '{}') as typeof sent;
    return Promise.resolve(new Response(JSON.stringify(body)));
  }) as unknown as typeof globalThis.fetch;
}

function wireUser(overrides: Record<string, unknown> = {}) {
  return {
    key: 'user:system:alice',
    displayName: 'Alice',
    login: 'alice',
    email: 'alice@example.com',
    idProvider: 'system',
    hasPassword: true,
    ...overrides,
  };
}

beforeEach(() => {
  setGraphQlEndpoint(ENDPOINT);
  sent = undefined;
});

afterEach(() => {
  vi.restoreAllMocks();
});

const ENDPOINT = '/admin/tool/_/admin:extension/app:users/graphql';

describe('fetchUserDetail', () => {
  it('carries the transitive choice as a variable', async () => {
    respondWith({ data: { user: { ...wireUser(), roles: [], groups: [], publicKeys: [] } } });

    await fetchUserDetail('user:system:alice', true);

    expect(sent?.variables).toEqual({ key: 'user:system:alice', transitive: true });
    expect(sent?.query).toContain('roles(transitive: $transitive)');
    expect(sent?.query).toContain('groups(transitive: $transitive)');
  });
});

describe('sendUserCreation', () => {
  it('sends every value as a variable, never through the query text', async () => {
    respondWith({ data: { createUser: wireUser() } });

    await sendUserCreation('system', 'alice', {
      displayName: 'Alice',
      email: 'alice@example.com',
      password: 'Str0ng!Passw0rd',
      roles: ['role:cms.admin' as PrincipalKey],
      groups: ['group:system:editors' as PrincipalKey],
    });

    expect(sent?.variables).toEqual({
      idProvider: 'system',
      name: 'alice',
      displayName: 'Alice',
      email: 'alice@example.com',
      password: 'Str0ng!Passw0rd',
      roles: ['role:cms.admin'],
      groups: ['group:system:editors'],
    });
    expect(sent?.query).not.toContain('Str0ng!Passw0rd');
  });

  it('asks for no password in the answer', async () => {
    respondWith({ data: { createUser: wireUser() } });

    await sendUserCreation('system', 'alice', {
      displayName: 'Alice',
      password: 'Str0ng!Passw0rd',
      roles: [],
      groups: [],
    });

    expect(sent?.query).not.toContain('password {');
    expect(sent?.query).toContain('hasPassword');
  });

  it('maps the user the server wrote', async () => {
    respondWith({ data: { createUser: wireUser() } });

    const user = (
      await sendUserCreation('system', 'alice', { displayName: 'Alice', roles: [], groups: [] })
    )._unsafeUnwrap();

    expect(user).toEqual({
      type: 'user',
      key: 'user:system:alice',
      displayName: 'Alice',
      login: 'alice',
      email: 'alice@example.com',
      idProvider: 'system',
      hasPassword: true,
    });
  });

  it('fails when the field came back null', async () => {
    respondWith({ data: { createUser: null } });

    const result = await sendUserCreation('system', 'alice', {
      displayName: 'Alice',
      roles: [],
      groups: [],
    });

    expect(result.isErr()).toBe(true);
  });

  it('fails with the message the server gave', async () => {
    respondWith({ errors: [{ message: 'Email address is already in use' }] });

    const result = await sendUserCreation('system', 'alice', {
      displayName: 'Alice',
      roles: [],
      groups: [],
    });

    expect(result._unsafeUnwrapErr().message).toBe('Email address is already in use');
  });
});

describe('sendUserUpdate', () => {
  function changes(overrides: Record<string, unknown> = {}) {
    return {
      displayName: 'Alice',
      addRoles: [],
      removeRoles: [],
      addGroups: [],
      removeGroups: [],
      ...overrides,
    };
  }

  it('sends the key and the four change lists', async () => {
    respondWith({ data: { updateUser: wireUser() } });

    await sendUserUpdate(
      'user:system:alice',
      changes({
        addRoles: ['role:cms.expert' as PrincipalKey],
        removeRoles: ['role:cms.admin' as PrincipalKey],
        addGroups: ['group:system:editors' as PrincipalKey],
        removeGroups: ['group:system:ops' as PrincipalKey],
      }),
    );

    expect(sent?.variables).toMatchObject({
      key: 'user:system:alice',
      addRoles: ['role:cms.expert'],
      removeRoles: ['role:cms.admin'],
      addGroups: ['group:system:editors'],
      removeGroups: ['group:system:ops'],
    });
  });

  it('keeps an absent password absent and an empty one empty', async () => {
    respondWith({ data: { updateUser: wireUser() } });

    await sendUserUpdate('user:system:alice', changes());
    expect(sent?.variables?.password).toBeUndefined();

    await sendUserUpdate('user:system:alice', changes({ password: '' }));
    expect(sent?.variables?.password).toBe('');
  });

  it('fails when the field came back null', async () => {
    respondWith({ data: { updateUser: null } });

    expect((await sendUserUpdate('user:system:gone', changes())).isErr()).toBe(true);
  });
});
