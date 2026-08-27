import { errAsync, okAsync, ResultAsync } from 'neverthrow';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '../../../shared/api';
import { fetchUserDetail, fetchUserMemberships } from '../api/users.api';
import type { PrincipalRef, User, UserDetail } from './principal.types';
import { $userDetail, forgetUserDetails, forgetUsers, showUser } from './user-detail.load';
import { $users } from './users.store';

// The api is stubbed rather than the transport: which of the two reads the panel makes is the interesting
// part, and each has a name.
vi.mock('../api/users.api', () => ({
  fetchUserDetail: vi.fn(),
  fetchUserMemberships: vi.fn(),
}));

const DEBOUNCE_MS = 250;

const ADMIN: PrincipalRef = {
  key: 'role:system.admin' as PrincipalRef['key'],
  type: 'role',
  displayName: 'Administrator',
};

function row(login: string): User {
  return {
    type: 'user',
    key: `user:system:${login}` as User['key'],
    displayName: login,
    login,
    idProvider: 'system',
    hasPassword: true,
  };
}

function detail(login: string): UserDetail {
  return { ...row(login), roles: [ADMIN], groups: [], publicKeys: [] };
}

function answered(login: string) {
  return okAsync<UserDetail | undefined, AppError>(detail(login));
}

function answeredNothing() {
  return okAsync<UserDetail | undefined, AppError>(undefined);
}

function loadRows(...logins: readonly string[]): void {
  $users.set({
    status: 'ready',
    items: logins.map(row),
    total: logins.length,
    appending: false,
    exhausted: false,
  });
}

/** Every read the panel made, whichever of the two it was. */
function reads(): number {
  return (
    vi.mocked(fetchUserDetail).mock.calls.length + vi.mocked(fetchUserMemberships).mock.calls.length
  );
}

/** The key the panel asked for, on read number `nth`. */
function askedFor(nth = 0): string | undefined {
  return vi.mocked(fetchUserDetail).mock.calls[nth]?.[0];
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(fetchUserDetail).mockReset();
  vi.mocked(fetchUserMemberships).mockReset();
  vi.mocked(fetchUserDetail).mockReturnValue(answered('alice'));
  vi.mocked(fetchUserMemberships).mockReturnValue(answered('alice'));
});

afterEach(() => {
  forgetUsers();
  $users.set({ status: 'loading', items: [], total: 0, appending: false, exhausted: false });
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('showUser', () => {
  // ! The row already carries every scalar the panel shows, so asking for them again would be re-reading
  // ! what is on screen. Only the memberships are absent from a row.
  it('reads only the memberships when the list already holds the row', async () => {
    loadRows('alice');

    showUser('user:system:alice');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(vi.mocked(fetchUserMemberships)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(fetchUserMemberships).mock.calls[0]?.[0]).toEqual(row('alice'));
    expect(vi.mocked(fetchUserDetail)).not.toHaveBeenCalled();
    expect($userDetail.get().item?.roles).toHaveLength(1);
  });

  // ! The case the by-key read exists for: a link opened straight at a key, or a search that narrowed
  // ! past it. There is no row to complete, so the whole user is read.
  it('reads the whole user when the loaded page does not carry the row', async () => {
    showUser('user:system:alice');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(vi.mocked(fetchUserDetail)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(fetchUserMemberships)).not.toHaveBeenCalled();
    expect($userDetail.get().item?.login).toBe('alice');
  });

  it('starts idle, with nothing selected', () => {
    expect($userDetail.get()).toEqual({ status: 'idle' });
  });

  it('loads the user a key names and reports it ready', async () => {
    showUser('user:system:alice');

    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(askedFor()).toBe('user:system:alice');
    const { status, item: user } = $userDetail.get();
    expect(status).toBe('ready');
    expect(user?.login).toBe('alice');
    expect(user?.roles).toHaveLength(1);
  });

  it('sends nothing before the debounce has elapsed', () => {
    showUser('user:system:alice');

    vi.advanceTimersByTime(DEBOUNCE_MS - 1);

    expect(reads()).toBe(0);
    expect($userDetail.get().status).toBe('loading');
  });

  // ! What the debounce exists for: holding an arrow key down walks the route through every row, and each
  // ! would otherwise be a request through a transport that sends one at a time.
  it('asks only for the row the stepping stopped on', async () => {
    showUser('user:system:alice');
    vi.advanceTimersByTime(100);
    showUser('user:system:bob');
    vi.advanceTimersByTime(100);
    showUser('user:system:carol');

    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(reads()).toBe(1);
    expect(askedFor()).toBe('user:system:carol');
  });

  it('serves a key it has already loaded without asking again', async () => {
    showUser('user:system:alice');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    vi.mocked(fetchUserDetail).mockReturnValue(answered('bob'));
    showUser('user:system:bob');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    showUser('user:system:alice');

    // Immediately, with no timer to wait for and no second read.
    expect($userDetail.get().status).toBe('ready');
    expect($userDetail.get().item?.login).toBe('alice');
    expect(reads()).toBe(2);
  });

  it('keeps the user on screen while the next one loads, so stepping does not flash empty', async () => {
    showUser('user:system:alice');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    vi.mocked(fetchUserDetail).mockReturnValue(answered('bob'));
    showUser('user:system:bob');

    const { status, item: user } = $userDetail.get();
    expect(status).toBe('loading');
    expect(user?.login).toBe('alice');
  });

  it('empties the panel when nothing is selected', async () => {
    showUser('user:system:alice');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    showUser(undefined);

    expect($userDetail.get()).toEqual({ status: 'idle' });
  });

  it('empties the panel for a key no user answers to, without calling it a failure', async () => {
    vi.mocked(fetchUserDetail).mockReturnValue(answeredNothing());

    showUser('user:system:gone');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect($userDetail.get()).toEqual({ status: 'idle' });
  });

  // ! A failure drops the user rather than keeping the previous one: the panel would otherwise describe
  // ! someone other than the selected row with nothing on screen to say so.
  it('drops the user it was showing when a load fails', async () => {
    showUser('user:system:alice');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    expect($userDetail.get().item?.login).toBe('alice');

    vi.mocked(fetchUserDetail).mockReturnValue(errAsync(new AppError('Principal is gone')));
    showUser('user:system:bob');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    const { status, item: user, error } = $userDetail.get();
    expect(status).toBe('error');
    expect(user).toBeUndefined();
    expect(error).toBe('Principal is gone');
  });

  // ! The answer to an overtaken row must not land after a newer one: the panel would then show a user
  // ! the list is no longer pointing at.
  it('drops the answer of a row a newer selection replaced', async () => {
    let answerSlowly: ((user: UserDetail | undefined) => void) | undefined;
    vi.mocked(fetchUserDetail).mockReturnValueOnce(
      ResultAsync.fromSafePromise(
        new Promise<UserDetail | undefined>((resolve) => {
          answerSlowly = resolve;
        }),
      ),
    );

    showUser('user:system:alice');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    vi.mocked(fetchUserDetail).mockReturnValue(answered('bob'));
    showUser('user:system:bob');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    answerSlowly?.(detail('alice'));
    await vi.advanceTimersByTimeAsync(0);

    expect($userDetail.get().item?.login).toBe('bob');
  });

  // ! A reload replaces the rows the cache was built from, so a cached hit would serve a user's old email
  // ! beside their updated row — and `Refresh` would never refresh the panel at all.
  it('asks again after the list reloaded, and re-reads the user on screen', async () => {
    loadRows('alice', 'bob');

    // Two keys cached, alice left on screen.
    showUser('user:system:bob');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    showUser('user:system:alice');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    const beforeReload = reads();

    forgetUserDetails();
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    // The open user was re-read rather than left as it was — `Refresh` refreshes the panel too.
    expect(reads()).toBe(beforeReload + 1);
    expect($userDetail.get().item?.login).toBe('alice');

    // And a key cached before the reload no longer answers from the cache.
    showUser('user:system:bob');
    expect($userDetail.get().status).toBe('loading');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    expect(reads()).toBe(beforeReload + 2);
  });

  it('carries no stale message into the next load', async () => {
    vi.mocked(fetchUserDetail).mockReturnValue(errAsync(new AppError('boom')));
    showUser('user:system:alice');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    expect($userDetail.get().error).toBe('boom');

    vi.mocked(fetchUserDetail).mockReturnValue(answered('bob'));
    showUser('user:system:bob');

    expect($userDetail.get().error).toBeUndefined();
  });

  it('asks again after the section was left, since the cache went with it', async () => {
    showUser('user:system:alice');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    forgetUsers();
    expect($userDetail.get()).toEqual({ status: 'idle' });

    showUser('user:system:alice');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(reads()).toBe(2);
  });

  // ! Stepping through a long list must not grow the cache without bound, so the oldest key goes first.
  it('forgets the oldest key once the cache is full', async () => {
    for (let index = 0; index <= 50; index += 1) {
      const login = `user${index}`;
      vi.mocked(fetchUserDetail).mockReturnValue(answered(login));
      showUser(`user:system:${login}`);
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    }

    const beforeReask = reads();
    vi.mocked(fetchUserDetail).mockReturnValue(answered('user0'));

    // The very first key was evicted, so it costs a read; the newest one is still free.
    showUser('user:system:user0');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    expect(reads()).toBe(beforeReask + 1);

    showUser('user:system:user50');
    expect($userDetail.get().status).toBe('ready');
    expect(reads()).toBe(beforeReask + 1);
  });
});
