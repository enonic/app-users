import { err, ok, okAsync, ResultAsync } from 'neverthrow';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '../../../shared/api';
import { fetchIdProviders } from '../api/id-providers.api';
import { loadIdProviders } from './id-providers.load';
import {
  $idProviderNameByKey,
  $idProviderNames,
  $idProviders,
  receiveIdProvider,
  receiveIdProviderNames,
} from './id-providers.store';
import type { IdProvider } from './principal.types';

// The store owns cancellation and status, not transport: stubbing the api keeps the request out of
// it and lets a test hold one answer back to show a slow load losing to a fast one.
vi.mock('../api/id-providers.api', () => ({ fetchIdProviders: vi.fn() }));

function provider(key: string, users = 0, bound = true): IdProvider {
  return {
    key,
    displayName: key,
    users: { total: users },
    groups: { total: 0 },
    ...(bound
      ? { application: { key: 'com.example.provider', displayName: 'Example provider' } }
      : {}),
  };
}

beforeEach(() => {
  vi.mocked(fetchIdProviders).mockReset();
  vi.mocked(fetchIdProviders).mockReturnValue(okAsync([provider('system', 3)]));
});

describe('loadIdProviders', () => {
  it('starts out loading with nothing to show', () => {
    expect($idProviders.get().status).toBe('loading');
    expect($idProviders.get().items).toEqual([]);
  });

  it('resolves to the providers the api returned', async () => {
    await loadIdProviders();

    const { status, items, error } = $idProviders.get();
    expect(status).toBe('ready');
    expect(items).toEqual([provider('system', 3)]);
    expect(error).toBeUndefined();
  });

  it('carries the count of a provider without its rows, and leaves an unbound one without a config', async () => {
    vi.mocked(fetchIdProviders).mockReturnValue(
      okAsync([provider('system', 3), provider('partners', 0, false)]),
    );

    await loadIdProviders();

    const { items } = $idProviders.get();
    const system = items.find(({ key }) => key === 'system');
    expect(system?.users.total).toBe(3);
    expect(system?.users.items).toBeUndefined();
    expect(items.find(({ key }) => key === 'partners')?.application).toBeUndefined();
  });

  it('reports loading again while it reloads', async () => {
    await loadIdProviders();

    const seen: string[] = [];
    const unbind = $idProviders.subscribe(({ status }) => seen.push(status));
    await loadIdProviders();
    unbind();

    expect(seen).toEqual(['ready', 'loading', 'ready']);
  });

  it('drops the answer of the load a newer one replaced', async () => {
    const stale = provider('stale');
    const fresh = provider('fresh');
    let answerSlowly: ((providers: IdProvider[]) => void) | undefined;

    vi.mocked(fetchIdProviders)
      .mockReturnValueOnce(
        ResultAsync.fromSafePromise(
          new Promise<IdProvider[]>((resolve) => {
            answerSlowly = resolve;
          }),
        ),
      )
      .mockReturnValueOnce(ResultAsync.fromSafePromise(Promise.resolve([fresh])));

    const slowLoad = loadIdProviders();
    const fastLoad = loadIdProviders();
    await fastLoad;
    answerSlowly?.([stale]);
    await slowLoad;

    expect($idProviders.get().items).toEqual([fresh]);
  });
});

describe('the provider names the other sections read', () => {
  beforeEach(() => {
    $idProviderNames.set({ status: 'loading', items: [] });
  });

  it('carries a name per key, and nothing a screen would not show', () => {
    receiveIdProviderNames(ok([{ key: 'ldap', displayName: 'Corporate LDAP' }]));

    expect($idProviderNames.get()).toEqual({
      status: 'ready',
      items: [{ key: 'ldap', displayName: 'Corporate LDAP' }],
    });
  });

  it('projects the names to a lookup by key', () => {
    receiveIdProviderNames(
      ok([
        { key: 'system', displayName: 'System' },
        { key: 'ldap', displayName: 'Corporate LDAP' },
      ]),
    );

    expect($idProviderNameByKey.get().get('ldap')).toBe('Corporate LDAP');
    expect($idProviderNameByKey.get().get('gone')).toBeUndefined();
  });

  // The filter menu is built from this list while a ticked provider narrows the query: emptying it
  // would leave a narrowing with no entry left to untick.
  it('keeps the names it has when a read fails, and still reports the failure', () => {
    receiveIdProviderNames(ok([{ key: 'system', displayName: 'System' }]));

    receiveIdProviderNames(err(new AppError('Providers are unreachable')));

    expect($idProviderNames.get().items).toEqual([{ key: 'system', displayName: 'System' }]);
    expect($idProviderNames.get().status).toBe('error');
    expect($idProviderNames.get().error).toBe('Providers are unreachable');
  });
});

describe('receiveIdProvider', () => {
  // ! The reason this exists rather than a reload: a create is not in the search index yet.
  it('adds a provider the list has never seen', () => {
    $idProviders.set({ status: 'ready', items: [provider('ldap')] });

    receiveIdProvider(provider('intranet'));

    expect($idProviders.get().items.map(({ key }) => key)).toEqual(['ldap', 'intranet']);
  });

  it('replaces the row of a provider it already carries, leaving the rest alone', () => {
    $idProviders.set({ status: 'ready', items: [provider('ldap'), provider('intranet')] });

    receiveIdProvider({ ...provider('intranet'), displayName: 'Renamed' });

    expect($idProviders.get().items).toEqual([
      provider('ldap'),
      { ...provider('intranet'), displayName: 'Renamed' },
    ]);
  });
});
