import { errAsync, okAsync } from 'neverthrow';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { $idProviderNames } from '../../../entities/principal/model/id-providers.store';
import { showUser } from '../../../entities/principal/model/user-detail.load';
import { $userDetail } from '../../../entities/principal/model/user-detail.load';
import { $users } from '../../../entities/principal/model/users.store';
import { AppError, requestGraphQlDocument } from '../../../shared/api';
import { fetchUsersScreen } from '../api/users-screen.api';
import { $usersQuery, setUsersSearch, toggleUsersIdProvider } from './query.store';
import { loadMoreUsers, reloadUsersScreen } from './users.screen';

// The screen owns the query, the paging and the cancelling; stubbing the api keeps the transport out of
// it and lets a test hold one answer back.
vi.mock('../api/users-screen.api', () => ({ fetchUsersScreen: vi.fn() }));

// The details panel has a transport of its own, and one test below reaches through it. `AppError` stays
// real, since the stores report its message.
vi.mock('../../../shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../shared/api')>()),
  requestGraphQlDocument: vi.fn(),
}));

function wireUser(login: string) {
  return {
    key: `user:system:${login}`,
    displayName: login,
    login,
    email: null,
    idProvider: 'system',
    hasPassword: true,
  };
}

// The lean root the screens use asks for these two fields and nothing else.
const PROVIDER = { key: 'system', displayName: 'System', users: { total: 3 } };

function answered(logins: readonly string[], total: number, message?: string) {
  return okAsync({
    data: {
      users: { total, hits: logins.map(wireUser) },
      idProviders: [PROVIDER],
    },
    message,
  } as never);
}

/** The query the api was called with, on its call number `nth`. */
function askedOn(nth = 0) {
  return vi.mocked(fetchUsersScreen).mock.calls[nth]?.[0];
}

beforeEach(() => {
  vi.mocked(fetchUsersScreen).mockReset();
  vi.mocked(fetchUsersScreen).mockReturnValue(answered(['alice', 'bob'], 137));
});

afterEach(() => {
  $users.set({ status: 'loading', items: [], total: 0, appending: false, exhausted: false });
  $idProviderNames.set({ status: 'loading', items: [] });
  $usersQuery.set({ idProviders: [], sort: 'displayNameAsc' });
});

describe('reloadUsersScreen', () => {
  it('asks for the first page and fills both stores from one answer', async () => {
    await reloadUsersScreen();

    expect(vi.mocked(fetchUsersScreen)).toHaveBeenCalledTimes(1);
    expect(askedOn()?.start).toBe(0);
    expect(askedOn()?.count).toBe(50);
    expect($users.get().items).toHaveLength(2);
    expect($users.get().total).toBe(137);
    expect($idProviderNames.get().items).toHaveLength(1);
  });

  it('carries the search, the provider and the order the query store holds', async () => {
    setUsersSearch('  alice  ');
    toggleUsersIdProvider('ldap');

    await reloadUsersScreen();

    expect(askedOn()?.search).toBe('alice');
    expect(askedOn()?.idProviders).toEqual(['ldap']);
    expect(askedOn()?.sort).toBe('displayNameAsc');
  });

  // ! The whole point of the nullable root fields: one domain failing must not blank the other. And the
  // ! providers a reload could not read stay on screen, so a ticked one keeps its entry in the menu.
  it('fails only the domain whose field came back null, without losing the loaded providers', async () => {
    await reloadUsersScreen();
    expect($idProviderNames.get().items).toHaveLength(1);

    vi.mocked(fetchUsersScreen).mockReturnValue(
      okAsync({
        data: { users: { total: 1, hits: [wireUser('alice')] }, idProviders: null },
        message: 'Providers are unreachable',
      } as never),
    );

    await reloadUsersScreen();

    expect($users.get().status).toBe('ready');
    expect($idProviderNames.get().items).toHaveLength(1);
    expect($idProviderNames.get().status).toBe('error');
    expect($idProviderNames.get().error).toBe('Providers are unreachable');
  });

  /*
   * ! The details cache is built from rows this reload replaces, so a reload has to drop it — otherwise a
   * ! cached hit serves a user's old email beside their updated row, and `Refresh` never refreshes the
   * ! panel at all. Pinned here rather than only where the cache lives, because it is the screen that has
   * ! to remember to ask.
   */
  it('drops the cached details, so the panel cannot serve pre-reload data', async () => {
    vi.mocked(requestGraphQlDocument).mockReturnValue(
      okAsync({ user: { ...wireUser('alice'), roles: [], groups: [], publicKeys: [] } } as never),
    );

    vi.useFakeTimers();
    try {
      await reloadUsersScreen();

      showUser('user:system:alice');
      await vi.advanceTimersByTimeAsync(300);
      expect($userDetail.get().item?.login).toBe('alice');
      const readsBefore = vi.mocked(requestGraphQlDocument).mock.calls.length;

      await reloadUsersScreen();
      await vi.advanceTimersByTimeAsync(300);

      // The open user was read again rather than served from a cache built on the replaced rows.
      expect(vi.mocked(requestGraphQlDocument).mock.calls.length).toBe(readsBefore + 1);
      expect($userDetail.get().item?.login).toBe('alice');
    } finally {
      vi.useRealTimers();
    }
  });

  it('fails both domains when the request itself fails', async () => {
    vi.mocked(fetchUsersScreen).mockReturnValue(errAsync(new AppError('Network is down')));

    await reloadUsersScreen();

    expect($users.get().status).toBe('error');
    expect($idProviderNames.get().status).toBe('error');
  });
});

describe('loadMoreUsers', () => {
  it('asks for the next page from where the loaded rows end', async () => {
    await reloadUsersScreen();
    vi.mocked(fetchUsersScreen).mockReturnValue(answered(['carol'], 137));

    await loadMoreUsers();

    expect(askedOn(1)?.start).toBe(2);
    expect($users.get().items.map(({ login }) => login)).toEqual(['alice', 'bob', 'carol']);
  });

  it('carries the same query as the page before it', async () => {
    setUsersSearch('alice');
    await reloadUsersScreen();
    vi.mocked(fetchUsersScreen).mockReturnValue(answered(['carol'], 137));

    await loadMoreUsers();

    expect(askedOn(1)?.search).toBe('alice');
  });

  /*
   * ! What actually protects the append from a changed query, since it reads the live one: a query change
   * ! reloads, and the reload aborts the page in flight. Without that abort, an offset from the old result
   * ! set would append rows belonging to a query the user has already left.
   */
  it('drops a page in flight when the query changes under it', async () => {
    await reloadUsersScreen();

    let answerSlowly: ((value: unknown) => void) | undefined;
    vi.mocked(fetchUsersScreen)
      .mockReturnValueOnce({
        match: (onOk: (value: unknown) => void) =>
          new Promise<void>((resolve) => {
            answerSlowly = (value) => {
              onOk(value);
              resolve();
            };
          }),
      } as never)
      .mockReturnValueOnce(answered(['zoe'], 1));

    const stale = loadMoreUsers();
    setUsersSearch('zoe');
    await reloadUsersScreen();
    answerSlowly?.({
      data: { users: { total: 137, hits: [wireUser('carol')] }, idProviders: [PROVIDER] },
    });
    await stale;

    expect($users.get().items.map(({ login }) => login)).toEqual(['zoe']);
  });

  // ! Two clicks are one page: a second request would ask for the same offset and append the rows twice.
  it('ignores a second call while a page is on its way', async () => {
    await reloadUsersScreen();

    let answerSlowly: ((value: unknown) => void) | undefined;
    vi.mocked(fetchUsersScreen).mockReturnValueOnce({
      match: (onOk: (value: unknown) => void) =>
        new Promise<void>((resolve) => {
          answerSlowly = (value) => {
            onOk(value);
            resolve();
          };
        }),
    } as never);

    const first = loadMoreUsers();
    await loadMoreUsers();
    expect(vi.mocked(fetchUsersScreen)).toHaveBeenCalledTimes(2);

    answerSlowly?.({
      data: { users: { total: 137, hits: [wireUser('carol')] }, idProviders: [PROVIDER] },
    });
    await first;

    expect($users.get().items.map(({ login }) => login)).toEqual(['alice', 'bob', 'carol']);
  });

  it('does nothing before a first page has arrived', async () => {
    await loadMoreUsers();

    expect(vi.mocked(fetchUsersScreen)).not.toHaveBeenCalled();
  });

  // ! A providers half that failed must not empty the loaded list: with a provider ticked, the filter would
  // ! lose the entry that is still narrowing the query and leave nothing to untick it with. It is reported,
  // ! so the screen can say the menu may be short — it just keeps what it has.
  it('keeps the provider list when a page arrives without it', async () => {
    await reloadUsersScreen();
    expect($idProviderNames.get().items).toHaveLength(1);

    vi.mocked(fetchUsersScreen).mockReturnValue(
      okAsync({
        data: { users: { total: 137, hits: [wireUser('carol')] }, idProviders: null },
        message: 'Providers are unreachable',
      } as never),
    );

    await loadMoreUsers();

    expect($users.get().items).toHaveLength(3);
    expect($idProviderNames.get().items).toHaveLength(1);
    expect($idProviderNames.get().status).toBe('error');
    expect($idProviderNames.get().error).toBe('Providers are unreachable');
  });

  // ! A failed `Load more` keeps what is on screen — the rows are what the user is reading.
  it('keeps the loaded rows when the next page fails', async () => {
    await reloadUsersScreen();
    vi.mocked(fetchUsersScreen).mockReturnValue(errAsync(new AppError('Network is down')));

    await loadMoreUsers();

    expect($users.get().status).toBe('ready');
    expect($users.get().items).toHaveLength(2);
    expect($users.get().error).toBe('Network is down');
  });

  it('drops the answer of a page a reload replaced', async () => {
    await reloadUsersScreen();

    let answerSlowly: ((value: unknown) => void) | undefined;
    vi.mocked(fetchUsersScreen)
      .mockReturnValueOnce({
        match: (onOk: (value: unknown) => void) =>
          new Promise<void>((resolve) => {
            answerSlowly = (value) => {
              onOk(value);
              resolve();
            };
          }),
      } as never)
      .mockReturnValueOnce(answered(['dave'], 1));

    const stale = loadMoreUsers();
    await reloadUsersScreen();
    answerSlowly?.({
      data: { users: { total: 137, hits: [wireUser('carol')] }, idProviders: [PROVIDER] },
    });
    await stale;

    expect($users.get().items.map(({ login }) => login)).toEqual(['dave']);
  });
});
