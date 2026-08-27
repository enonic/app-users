import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setGraphQlEndpoint } from '../../../shared/api';
import {
  fetchIdProviderPrincipalPage,
  fetchIdProviderPrincipals,
  ID_PROVIDER_PRINCIPALS_PAGE,
  sendIdProviderCreation,
  sendIdProviderDeletion,
  sendIdProviderUpdate,
  type IdProviderInput,
} from './id-providers.api';

let sent: { query?: string; variables?: unknown } | undefined;

function respondWith(body: unknown): void {
  globalThis.fetch = vi.fn((_url: unknown, options?: { body?: string }) => {
    sent = JSON.parse(options?.body ?? '{}') as { query?: string; variables?: unknown };
    return Promise.resolve(new Response(JSON.stringify(body)));
  }) as unknown as typeof globalThis.fetch;
}

function wireIdProvider(overrides: Record<string, unknown> = {}) {
  return {
    key: 'ldap',
    displayName: 'Company directory',
    description: null,
    application: { key: 'com.example.ldap', displayName: 'LDAP login' },
    users: { total: 0 },
    groups: { total: 0 },
    ...overrides,
  };
}

function input(overrides: Partial<IdProviderInput> = {}): IdProviderInput {
  return {
    displayName: 'Company directory',
    application: 'com.example.ldap',
    permissions: [{ principal: 'role:system.admin', access: 'ADMINISTRATOR' }],
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

describe('sendIdProviderCreation', () => {
  it('carries the name and the whole input as variables, never as query text', async () => {
    respondWith({ data: { createIdProvider: wireIdProvider() } });

    await sendIdProviderCreation('ldap', input());

    expect(sent?.variables).toEqual({
      name: 'ldap',
      displayName: 'Company directory',
      application: 'com.example.ldap',
      permissions: [{ principal: 'role:system.admin', access: 'ADMINISTRATOR' }],
    });
    expect(sent?.query).not.toContain('com.example.ldap');
  });

  it('maps the written provider back to the row the list shows', async () => {
    respondWith({ data: { createIdProvider: wireIdProvider() } });

    const provider = (await sendIdProviderCreation('ldap', input()))._unsafeUnwrap();

    expect(provider).toEqual({
      key: 'ldap',
      displayName: 'Company directory',
      description: undefined,
      application: { key: 'com.example.ldap', displayName: 'LDAP login' },
      users: { total: 0 },
      groups: { total: 0 },
    });
  });

  // ! A write that answered null is a failure: nothing else says whether it happened.
  it('fails when the field answered null', async () => {
    respondWith({ data: { createIdProvider: null } });

    expect((await sendIdProviderCreation('ldap', input())).isErr()).toBe(true);
  });
});

describe('sendIdProviderUpdate', () => {
  it('addresses the provider by key and states the rest', async () => {
    respondWith({ data: { updateIdProvider: wireIdProvider({ displayName: 'Renamed' }) } });

    await sendIdProviderUpdate('ldap', input({ displayName: 'Renamed' }));

    expect(sent?.variables).toEqual({
      key: 'ldap',
      displayName: 'Renamed',
      application: 'com.example.ldap',
      permissions: [{ principal: 'role:system.admin', access: 'ADMINISTRATOR' }],
    });
  });

  it('fails when no provider answered to the key', async () => {
    respondWith({ data: { updateIdProvider: null } });

    expect((await sendIdProviderUpdate('gone', input())).isErr()).toBe(true);
  });
});

describe('sendIdProviderDeletion', () => {
  it('answers one outcome per key, with a missing reason read as absent', async () => {
    respondWith({
      data: {
        deleteIdProviders: [
          { key: 'ldap', deleted: true, reason: null },
          { key: 'system', deleted: false, reason: 'It holds users' },
        ],
      },
    });

    const outcomes = (await sendIdProviderDeletion(['ldap', 'system']))._unsafeUnwrap();

    expect(outcomes).toEqual([
      { key: 'ldap', deleted: true, reason: undefined },
      { key: 'system', deleted: false, reason: 'It holds users' },
    ]);
  });

  it('fails when the field could not be read at all', async () => {
    respondWith({ errors: [{ message: 'nope' }] });

    expect((await sendIdProviderDeletion(['ldap'])).isErr()).toBe(true);
  });
});

describe('fetchIdProviderPrincipals', () => {
  it('asks for the first page of both sets, with the total beside each', async () => {
    respondWith({
      data: {
        idProvider: {
          key: 'ldap',
          users: {
            total: 4213,
            items: [{ key: 'user:ldap:alice', type: 'user', displayName: 'Alice' }],
          },
          groups: { total: 0, items: [] },
        },
      },
    });

    const principals = (await fetchIdProviderPrincipals('ldap'))._unsafeUnwrap();

    expect(sent?.variables).toEqual({
      key: 'ldap',
      start: 0,
      count: ID_PROVIDER_PRINCIPALS_PAGE,
    });
    expect(principals?.users.total).toBe(4213);
    expect(principals?.users.items).toHaveLength(1);
  });

  it('answers nothing for a key no provider answers to', async () => {
    respondWith({ data: { idProvider: null } });

    expect((await fetchIdProviderPrincipals('gone'))._unsafeUnwrap()).toBeUndefined();
  });
});

describe('fetchIdProviderPrincipalPage', () => {
  it('asks for one set from where the loaded rows end', async () => {
    respondWith({ data: { idProvider: { key: 'ldap', groups: { total: 120, items: [] } } } });

    const page = (await fetchIdProviderPrincipalPage('ldap', 'group', 50))._unsafeUnwrap();

    expect(sent?.variables).toEqual({
      key: 'ldap',
      start: 50,
      count: ID_PROVIDER_PRINCIPALS_PAGE,
    });
    expect(sent?.query).not.toContain('users');
    expect(page?.total).toBe(120);
  });

  it('answers nothing for a key no provider answers to, which ends the paging', async () => {
    respondWith({ data: { idProvider: null } });

    expect(
      (await fetchIdProviderPrincipalPage('gone', 'user', 50))._unsafeUnwrap(),
    ).toBeUndefined();
  });
});
