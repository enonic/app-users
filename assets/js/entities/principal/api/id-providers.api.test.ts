import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setGraphQlEndpoint } from '../../../shared/api';
import { DETAILS_LIST_PAGE_SIZE } from '../../../shared/load-more';
import {
  fetchIdProviderConfig,
  fetchIdProviderPrincipalPage,
  fetchIdProviderPrincipals,
  requestIdProviderExists,
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

  it('carries an applied configuration as a variable, as the tree it is', async () => {
    const config = [{ name: 'clientId', type: 'String' as const, values: [{ v: 'intranet' }] }];
    respondWith({ data: { updateIdProvider: wireIdProvider() } });

    await sendIdProviderUpdate('ldap', input({ config }));

    expect(sent?.variables).toMatchObject({ key: 'ldap', config });
  });

  // ! graphql-java names the scalar `JSON`, whatever `lib/graphql` exports it as; `Json` fails validation.
  it("declares the configuration as the schema's JSON scalar", async () => {
    respondWith({ data: { updateIdProvider: wireIdProvider() } });

    await sendIdProviderUpdate('ldap', input());

    expect(sent?.query).toContain('$config: JSON');
  });

  it('fails when no provider answered to the key', async () => {
    respondWith({ data: { updateIdProvider: null } });

    expect((await sendIdProviderUpdate('gone', input())).isErr()).toBe(true);
  });
});

describe('fetchIdProviderConfig', () => {
  it('answers the binding with the tree it holds', async () => {
    const config = [{ name: 'clientId', type: 'String', values: [{ v: 'intranet' }] }];
    respondWith({
      data: { idProvider: { key: 'ldap', application: { key: 'com.example.ldap', config } } },
    });

    const result = await fetchIdProviderConfig('ldap');

    expect(result._unsafeUnwrap()).toEqual({ application: 'com.example.ldap', config });
    expect(sent?.variables).toEqual({ key: 'ldap' });
  });

  it.each([
    ['no provider answers to the key', null],
    ['the provider is bound to nothing', { key: 'ldap', application: null }],
  ])('answers nothing when %s', async (_, idProvider) => {
    respondWith({ data: { idProvider } });

    expect((await fetchIdProviderConfig('ldap'))._unsafeUnwrap()).toBeUndefined();
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
      count: DETAILS_LIST_PAGE_SIZE,
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

    const page = (await fetchIdProviderPrincipalPage('ldap', 'group', 10))._unsafeUnwrap();

    expect(sent?.variables).toEqual({ key: 'ldap', start: 10, count: DETAILS_LIST_PAGE_SIZE });
    expect(sent?.query).not.toContain('users');
    expect(page?.total).toBe(120);
  });

  it('answers nothing for a key no provider answers to, which ends the paging', async () => {
    respondWith({ data: { idProvider: null } });

    expect(
      (await fetchIdProviderPrincipalPage('gone', 'user', 10))._unsafeUnwrap(),
    ).toBeUndefined();
  });
});

describe('requestIdProviderExists', () => {
  it('reads a key no provider answers to as free', async () => {
    respondWith({ data: { idProvider: null } });

    const result = await requestIdProviderExists('ldap');

    expect(result._unsafeUnwrap()).toBe(false);
    expect(sent?.variables).toEqual({ key: 'ldap' });
  });

  it('asks for the key alone, and reads an answer as taken', async () => {
    respondWith({ data: { idProvider: { key: 'ldap' } } });

    const result = await requestIdProviderExists('ldap');

    expect(result._unsafeUnwrap()).toBe(true);
    expect(sent?.query).not.toContain('displayName');
  });
});
