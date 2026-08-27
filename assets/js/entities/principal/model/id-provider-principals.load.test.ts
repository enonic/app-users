import { okAsync, ResultAsync } from 'neverthrow';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AppError } from '../../../shared/api';
import { fetchIdProviderPrincipalPage, fetchIdProviderPrincipals } from '../api/id-providers.api';
import {
  forgetIdProviderPrincipalRows,
  loadMoreIdProviderPrincipals,
  reloadIdProviderPrincipalRows,
  showIdProviderPrincipals,
} from './id-provider-principals.load';
import { $idProviderPrincipals } from './id-provider-principals.store';
import type { IdProviderPrincipals, PrincipalPage, PrincipalRef } from './principal.types';

vi.mock('../api/id-providers.api', () => ({
  fetchIdProviderPrincipals: vi.fn(),
  fetchIdProviderPrincipalPage: vi.fn(),
}));

const DEBOUNCE_MS = 250;

function principal(name: string): PrincipalRef {
  return { key: `user:ldap:${name}` as PrincipalRef['key'], type: 'user', displayName: name };
}

function answered(key: string, ...names: readonly string[]) {
  return okAsync<IdProviderPrincipals | undefined, AppError>({
    key,
    users: { total: 100, items: names.map(principal) },
    groups: { total: 0, items: [] },
  });
}

function page(...names: readonly string[]) {
  return okAsync<PrincipalPage | undefined, AppError>({
    total: 100,
    items: names.map(principal),
  });
}

/** Every read for the panel, whichever of the two it was. */
function reads(): number {
  return (
    vi.mocked(fetchIdProviderPrincipals).mock.calls.length +
    vi.mocked(fetchIdProviderPrincipalPage).mock.calls.length
  );
}

function loaded(): string[] {
  return $idProviderPrincipals.get().users.items.map(({ displayName }) => displayName);
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(fetchIdProviderPrincipals).mockReset();
  vi.mocked(fetchIdProviderPrincipalPage).mockReset();
  vi.mocked(fetchIdProviderPrincipals).mockReturnValue(answered('ldap', 'alice'));
  vi.mocked(fetchIdProviderPrincipalPage).mockReturnValue(page('bob'));
});

afterEach(() => {
  forgetIdProviderPrincipalRows();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('showIdProviderPrincipals', () => {
  it('reads the first page of both sets for the selected provider', async () => {
    showIdProviderPrincipals('ldap');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(vi.mocked(fetchIdProviderPrincipals).mock.calls[0]?.[0]).toBe('ldap');
    expect($idProviderPrincipals.get().status).toBe('ready');
    expect(loaded()).toEqual(['alice']);
  });

  it('asks only for the provider the stepping stopped on', async () => {
    showIdProviderPrincipals('ldap');
    vi.advanceTimersByTime(100);
    showIdProviderPrincipals('azure');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(reads()).toBe(1);
    expect(vi.mocked(fetchIdProviderPrincipals).mock.calls[0]?.[0]).toBe('azure');
  });

  // ! The panel remounts with the key it is already reading — the route replaces the item component — and
  // ! cancelling that read without starting another would leave the panel loading for good.
  it('leaves a read for the key it already holds running', async () => {
    showIdProviderPrincipals('ldap');
    showIdProviderPrincipals('ldap');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(reads()).toBe(1);
    expect($idProviderPrincipals.get().status).toBe('ready');
  });

  it('empties the panel when nothing is selected', async () => {
    showIdProviderPrincipals('ldap');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    showIdProviderPrincipals(undefined);

    expect($idProviderPrincipals.get().key).toBeUndefined();
    expect(loaded()).toEqual([]);
  });
});

describe('reloadIdProviderPrincipalRows', () => {
  // ! The panel asks by key, so dropping the rows on `Refresh` leaves it empty until the selection moves.
  it('re-reads the provider on screen rather than leaving the panel empty', async () => {
    showIdProviderPrincipals('ldap');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    vi.mocked(fetchIdProviderPrincipals).mockReturnValue(answered('ldap', 'alice', 'bob'));
    reloadIdProviderPrincipalRows();
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(reads()).toBe(2);
    expect($idProviderPrincipals.get().key).toBe('ldap');
    expect(loaded()).toEqual(['alice', 'bob']);
  });

  it('reads nothing when no provider is selected', async () => {
    reloadIdProviderPrincipalRows();
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(reads()).toBe(0);
  });
});

describe('forgetIdProviderPrincipalRows', () => {
  // ! The section was left: a debounced read still on its way would ask for a screen nobody is on.
  it('drops the rows and the read that was on its way', async () => {
    showIdProviderPrincipals('ldap');
    forgetIdProviderPrincipalRows();
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(reads()).toBe(0);
    expect($idProviderPrincipals.get().key).toBeUndefined();
  });
});

describe('loadMoreIdProviderPrincipals', () => {
  it('appends the next page of the set it was asked for', async () => {
    showIdProviderPrincipals('ldap');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    loadMoreIdProviderPrincipals('user');
    await vi.advanceTimersByTimeAsync(0);

    expect(vi.mocked(fetchIdProviderPrincipalPage).mock.calls[0]?.slice(0, 3)).toEqual([
      'ldap',
      'user',
      1,
    ]);
    expect(loaded()).toEqual(['alice', 'bob']);
  });

  // ! A page that answers after the selection moved holds the previous provider's principals, and the
  // ! panel is now showing another provider.
  it('files no page under the provider that replaced the one it was read for', async () => {
    let answerSlowly: ((page: PrincipalPage | undefined) => void) | undefined;
    vi.mocked(fetchIdProviderPrincipalPage).mockReturnValueOnce(
      ResultAsync.fromSafePromise(
        new Promise<PrincipalPage | undefined>((resolve) => {
          answerSlowly = resolve;
        }),
      ),
    );

    showIdProviderPrincipals('ldap');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    loadMoreIdProviderPrincipals('user');

    vi.mocked(fetchIdProviderPrincipals).mockReturnValue(answered('azure', 'carol'));
    showIdProviderPrincipals('azure');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    answerSlowly?.({ total: 100, items: [principal('bob')] });
    await vi.advanceTimersByTimeAsync(0);

    expect($idProviderPrincipals.get().key).toBe('azure');
    expect(loaded()).toEqual(['carol']);
  });
});
