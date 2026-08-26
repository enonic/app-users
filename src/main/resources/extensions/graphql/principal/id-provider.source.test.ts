import {
  createIdProvider,
  deleteIdProviders,
  getIdProvider,
  updateIdProvider,
} from '/lib/idprovider';
import {
  findPrincipals,
  getIdProviders,
  type Group,
  type IdProvider,
  type User,
} from '/lib/xp/auth';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  countPrincipals,
  createIdProvider as createProvider,
  deleteIdProviders as deleteProviders,
  listIdProviders,
  listPrincipals,
  principalSetOf,
  updateIdProvider as updateProvider,
} from './id-provider.source';

function provider(
  key: string,
  displayName: string,
  overrides: Partial<IdProvider> = {},
): IdProvider {
  return { key, displayName, ...overrides };
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

function group(key: string, displayName: string): Group {
  return {
    type: 'group',
    key: key as Group['key'],
    displayName,
    modifiedTime: '2026-08-01T10:00:00Z',
  };
}

function found(hits: (User | Group)[], total = hits.length) {
  return { total, count: hits.length, hits };
}

afterEach(() => {
  vi.resetAllMocks();
});

describe('listIdProviders', () => {
  it('sorts by display name, ignoring case', () => {
    vi.mocked(getIdProviders).mockReturnValue([
      provider('c', 'company directory'),
      provider('a', 'Archive'),
      provider('b', 'Backup'),
    ]);

    expect(listIdProviders().map(({ key }) => key)).toEqual(['a', 'b', 'c']);
  });

  it('falls back to the key for a provider with no display name', () => {
    const nameless = { key: 'partners' } as unknown as IdProvider;
    vi.mocked(getIdProviders).mockReturnValue([provider('zulu', 'Zulu'), nameless]);

    expect(listIdProviders().map(({ key }) => key)).toEqual(['partners', 'zulu']);
  });

  it('answers an empty list on an instance with no providers', () => {
    vi.mocked(getIdProviders).mockReturnValue([]);

    expect(listIdProviders()).toEqual([]);
  });
});

describe('principalSetOf', () => {
  it('carries the provider and the kind, resolving nothing on its own', () => {
    expect(principalSetOf('system', 'user')).toEqual({ idProvider: 'system', type: 'user' });
    expect(vi.mocked(findPrincipals)).not.toHaveBeenCalled();
  });
});

describe('countPrincipals', () => {
  it('asks the search for the total and no rows at all', () => {
    vi.mocked(findPrincipals).mockReturnValue(found([], 4213));

    expect(countPrincipals({ idProvider: 'ldap', type: 'user' })).toBe(4213);
    expect(vi.mocked(findPrincipals)).toHaveBeenCalledWith({
      type: 'user',
      idProvider: 'ldap',
      count: 0,
    });
  });

  it('answers zero for a provider holding none of that kind', () => {
    vi.mocked(findPrincipals).mockReturnValue(found([], 0));

    expect(countPrincipals({ idProvider: 'partners', type: 'group' })).toBe(0);
  });
});

describe('listPrincipals', () => {
  it('asks for the page of the kind the caller named', () => {
    vi.mocked(findPrincipals).mockReturnValue(found([]));

    listPrincipals({ idProvider: 'system', type: 'group' }, 100, 50);

    expect(vi.mocked(findPrincipals)).toHaveBeenCalledWith({
      type: 'group',
      idProvider: 'system',
      start: 100,
      count: 50,
    });
  });

  // ! Kept in the order the search answered: sorting a page would order that page alone, and the next
  // ! one would restart below it.
  it('reduces each principal to the three fields a row shows, leaving the order alone', () => {
    vi.mocked(findPrincipals).mockReturnValue(
      found([user('user:system:zoe', 'Zoe'), group('group:system:admins', 'Administrators')]),
    );

    expect(listPrincipals({ idProvider: 'system', type: 'user' }, 0, -1)).toEqual([
      { key: 'user:system:zoe', type: 'user', displayName: 'Zoe' },
      { key: 'group:system:admins', type: 'group', displayName: 'Administrators' },
    ]);
  });

  it('falls back to the name from the key when a principal carries no display name', () => {
    const nameless = { type: 'user', key: 'user:system:ghost' } as unknown as User;
    vi.mocked(findPrincipals).mockReturnValue(found([nameless]));

    expect(listPrincipals({ idProvider: 'system', type: 'user' }, 0, -1)[0]?.displayName).toBe(
      'ghost',
    );
  });
});

describe('createIdProvider', () => {
  it('binds the provider to the application it names, with an empty configuration', () => {
    vi.mocked(createIdProvider).mockReturnValue({
      key: 'intranet',
      displayName: 'Intranet',
      idProviderConfig: { applicationKey: 'com.enonic.app.oidc', config: [] },
    });

    const written = createProvider('intranet', {
      displayName: 'Intranet',
      application: 'com.enonic.app.oidc',
      permissions: [{ principal: 'role:system.admin', access: 'ADMINISTRATOR' }],
    });

    expect(vi.mocked(createIdProvider)).toHaveBeenCalledWith({
      key: 'intranet',
      displayName: 'Intranet',
      description: undefined,
      idProviderConfig: { applicationKey: 'com.enonic.app.oidc', config: [] },
      permissions: [{ principal: 'role:system.admin', access: 'ADMINISTRATOR' }],
    });
    expect(written.idProviderConfig).toEqual({ applicationKey: 'com.enonic.app.oidc' });
  });

  it('leaves a provider bound to nothing when no application is named', () => {
    vi.mocked(createIdProvider).mockReturnValue({ key: 'intranet', displayName: 'Intranet' });

    createProvider('intranet', { displayName: 'Intranet', permissions: [] });

    expect(vi.mocked(createIdProvider).mock.calls[0]?.[0].idProviderConfig).toBeUndefined();
  });

  it('fails loudly when the platform answered with nothing', () => {
    vi.mocked(createIdProvider).mockReturnValue(null);

    expect(() =>
      createProvider('intranet', { displayName: 'Intranet', permissions: [] }),
    ).toThrow();
  });
});

describe('updateIdProvider', () => {
  const stored = {
    key: 'intranet',
    displayName: 'Intranet',
    idProviderConfig: {
      applicationKey: 'com.enonic.app.oidc',
      config: [{ name: 'clientId', type: 'String', values: [{ v: 'settings' }] }],
    },
  };

  // ! The configuration nothing in this app renders must survive an edit that does not mention it.
  it('keeps the stored configuration when the application is unchanged', () => {
    vi.mocked(getIdProvider).mockReturnValue(stored);
    vi.mocked(updateIdProvider).mockReturnValue(stored);

    updateProvider('intranet', {
      displayName: 'Intranet renamed',
      application: 'com.enonic.app.oidc',
      permissions: [],
    });

    expect(vi.mocked(updateIdProvider).mock.calls[0]?.[0].idProviderConfig).toEqual(
      stored.idProviderConfig,
    );
  });

  it('starts an empty configuration when the provider is bound to another application', () => {
    vi.mocked(getIdProvider).mockReturnValue(stored);
    vi.mocked(updateIdProvider).mockReturnValue(stored);

    updateProvider('intranet', {
      displayName: 'Intranet',
      application: 'com.enonic.app.saml',
      permissions: [],
    });

    expect(vi.mocked(updateIdProvider).mock.calls[0]?.[0].idProviderConfig).toEqual({
      applicationKey: 'com.enonic.app.saml',
      config: [],
    });
  });

  it('unbinds the provider when no application is named, without reading the stored one', () => {
    vi.mocked(updateIdProvider).mockReturnValue({ key: 'intranet', displayName: 'Intranet' });

    updateProvider('intranet', { displayName: 'Intranet', permissions: [] });

    expect(vi.mocked(updateIdProvider).mock.calls[0]?.[0].idProviderConfig).toBeNull();
    expect(vi.mocked(getIdProvider)).not.toHaveBeenCalled();
  });

  it('answers null for a key no provider answers to', () => {
    vi.mocked(updateIdProvider).mockReturnValue(null);

    expect(updateProvider('gone', { displayName: 'Gone', permissions: [] })).toBeNull();
  });
});

describe('deleteIdProviders', () => {
  it('passes the keys through and answers one outcome per key', () => {
    const outcomes = [
      { key: 'intranet', deleted: true },
      { key: 'system', deleted: false, reason: 'Cannot delete' },
    ];
    vi.mocked(deleteIdProviders).mockReturnValue(outcomes);

    expect(deleteProviders(['intranet', 'system'])).toEqual(outcomes);
    expect(vi.mocked(deleteIdProviders)).toHaveBeenCalledWith({
      idProviders: ['intranet', 'system'],
    });
  });
});
