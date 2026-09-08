import { okAsync } from 'neverthrow';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { $idProviderNames } from '../../../entities/principal/model/id-providers.store';
import { $serviceAccounts } from '../../../entities/principal/model/service-accounts.store';
import { $users } from '../../../entities/principal/model/users.store';
import { fetchServiceAccountsScreen } from '../api/service-accounts-screen.api';
import { $serviceAccountsQuery, setServiceAccountsSearch } from './query.store';
import { serviceAccountsSelection } from './selection.store';
import {
  loadMoreServiceAccounts,
  refreshServiceAccountsScreen,
  reloadServiceAccountsScreen,
} from './service-accounts.screen';

// The screen owns the query, the paging and the cancelling; stubbing the api keeps the transport out.
vi.mock('../api/service-accounts-screen.api', () => ({ fetchServiceAccountsScreen: vi.fn() }));

function wireAccount(login: string) {
  return {
    key: `user:system:${login}`,
    displayName: login,
    login,
    email: null,
    idProvider: 'system',
    hasPassword: true,
  };
}

// The lean names root the screens share asks for these two fields and nothing else.
const PROVIDER = { key: 'system', displayName: 'System' };

function answered(logins: readonly string[], total: number, message?: string) {
  return okAsync({
    data: { users: { total, hits: logins.map(wireAccount) }, idProviders: [PROVIDER] },
    message,
  } as never);
}

/** The query the api was called with, on its call number `nth`. */
function askedOn(nth = 0) {
  return vi.mocked(fetchServiceAccountsScreen).mock.calls[nth]?.[0];
}

const EMPTY = {
  status: 'loading',
  items: [],
  total: 0,
  appending: false,
  exhausted: false,
} as const;

beforeEach(() => {
  vi.mocked(fetchServiceAccountsScreen).mockReset();
  vi.mocked(fetchServiceAccountsScreen).mockReturnValue(answered(['reporting', 'indexer'], 7));
});

afterEach(() => {
  $serviceAccounts.set({ ...EMPTY });
  $users.set({ ...EMPTY });
  $idProviderNames.set({ status: 'loading', items: [] });
  $serviceAccountsQuery.set({ sort: 'displayNameAsc' });
  serviceAccountsSelection.clear();
});

describe('reloadServiceAccountsScreen', () => {
  it('asks for the first page and fills both stores from one answer', async () => {
    await reloadServiceAccountsScreen();

    expect(askedOn()?.start).toBe(0);
    expect(askedOn()?.count).toBe(50);
    expect($serviceAccounts.get().items).toHaveLength(2);
    expect($serviceAccounts.get().total).toBe(7);
    // The provenance labels in the details panel resolve through the shared names store, and this
    // section may be the first one mounted in a session.
    expect($idProviderNames.get().items).toHaveLength(1);
  });

  it('carries the search and the order the query store holds', async () => {
    setServiceAccountsSearch('  reporting  ');

    await reloadServiceAccountsScreen();

    expect(askedOn()?.search).toBe('reporting');
    expect(askedOn()?.sort).toBe('displayNameAsc');
  });

  // ! The point of the second list instance: the host keeps the Users section mounted beside this one, so
  // ! a service-accounts page landing in a shared store would hand the hidden Users list the wrong rows.
  it('leaves the Users list untouched', async () => {
    $users.set({ ...EMPTY, status: 'ready', items: [], total: 137 });

    await reloadServiceAccountsScreen();

    expect($users.get().total).toBe(137);
    expect($users.get().items).toHaveLength(0);
    expect($serviceAccounts.get().items).toHaveLength(2);
  });
});

describe('loadMoreServiceAccounts', () => {
  it('asks for the next page from where the loaded rows end, with the same query', async () => {
    setServiceAccountsSearch('ing');
    await reloadServiceAccountsScreen();
    vi.mocked(fetchServiceAccountsScreen).mockReturnValue(answered(['exporter'], 7));

    await loadMoreServiceAccounts();

    expect(askedOn(1)?.start).toBe(2);
    expect(askedOn(1)?.search).toBe('ing');
    expect($serviceAccounts.get().items.map(({ login }) => login)).toEqual([
      'reporting',
      'indexer',
      'exporter',
    ]);
  });

  it('does nothing before a first page has arrived', async () => {
    await loadMoreServiceAccounts();

    expect(vi.mocked(fetchServiceAccountsScreen)).not.toHaveBeenCalled();
  });
});

describe('refreshServiceAccountsScreen', () => {
  it('re-reads from the start and drops ticks on rows that did not come back', async () => {
    await reloadServiceAccountsScreen();
    serviceAccountsSelection.replace(['user:system:reporting', 'user:system:indexer']);
    vi.mocked(fetchServiceAccountsScreen).mockReturnValue(answered(['reporting'], 1));

    await refreshServiceAccountsScreen();

    expect(askedOn(1)?.start).toBe(0);
    expect([...serviceAccountsSelection.$selected.get()]).toEqual(['user:system:reporting']);
  });
});
