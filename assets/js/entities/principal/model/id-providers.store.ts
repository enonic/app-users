import { computed, map, type ReadableAtom } from 'nanostores';
import type { Result } from 'neverthrow';

import type { AppError } from '../../../shared/api';
import type { IdProviderUserCount } from '../api/id-providers.api';
import type { IdProvider, IdProviderName } from './principal.types';

export type IdProvidersState = {
  status: 'loading' | 'ready' | 'error';
  items: readonly IdProvider[];
  error?: string;
};

export type IdProviderNamesState = {
  status: 'loading' | 'ready' | 'error';
  items: readonly IdProviderName[];
  error?: string;
};

export type IdProviderUserCountsState = {
  status: 'loading' | 'ready' | 'error';
  items: readonly IdProviderUserCount[];
  error?: string;
};

/** The ID Providers section's own list, with what only that section shows. */
export const $idProviders = map<IdProvidersState>({ status: 'loading', items: [] });

/**
 * The providers as the other sections need them: a name per key, and nothing that costs the server a
 * search. Filled by whichever screen is reading principals — each asks for it alongside its own
 * domain, in the same request.
 */
export const $idProviderNames = map<IdProviderNamesState>({ status: 'loading', items: [] });

/**
 * How many users each provider holds, which the Users filter needs to leave out a provider holding
 * none. One `count: 0` search per provider, asked for beside the page of users.
 */
export const $idProviderUserCounts = map<IdProviderUserCountsState>({
  status: 'loading',
  items: [],
});

/**
 * Provider name to display name, for the sections that show where a principal comes from.
 *
 * A principal key carries its provider's *name* (`group:ldap:developers`), and every screen wants
 * the name an administrator recognises — so the lookup is a projection over the list already loaded,
 * never a request of its own.
 */
export const $idProviderNameByKey: ReadableAtom<ReadonlyMap<string, string>> = computed(
  $idProviderNames,
  ({ items }) => new Map(items.map(({ key, displayName }) => [key, displayName])),
);

export function beginIdProvidersLoad(): void {
  $idProviders.setKey('status', 'loading');
}

export function beginIdProviderNamesLoad(): void {
  $idProviderNames.setKey('status', 'loading');
}

/** ! Keeps what it has on a failed read, for the reason `receiveIdProviderNames` explains. */
export function receiveIdProviders(result: Result<IdProvider[], AppError>): void {
  result.match(
    (items) => $idProviders.set({ status: 'ready', items }),
    (error) => $idProviders.set({ ...$idProviders.get(), status: 'error', error: error.message }),
  );
}

/**
 * ! The provider a write answered with, which a re-read cannot replace: `createIdProvider` does not
 * ! refresh the index `getIdProviders` searches, so a list read straight after a create is without it.
 * ! See `docs/platform-facts.md`. Order is the section's business, so a new one is appended.
 */
export function receiveIdProvider(provider: IdProvider): void {
  const { items } = $idProviders.get();
  const known = items.some(({ key }) => key === provider.key);

  $idProviders.setKey(
    'items',
    known
      ? items.map((loaded) => (loaded.key === provider.key ? provider : loaded))
      : [...items, provider],
  );
}

/**
 * ! Keeps the providers it has when a read fails, unlike a section's own list store.
 *
 * ! This list is a reference the other sections name principals by: Groups and Users show it in a filter
 * ! and in every row's provenance cell. Dropping it on a failed refresh emptied the filter menu while a
 * ! ticked provider went on narrowing the query — a narrowing with no entry left to untick. The failure is
 * ! still reported, so a screen can say the list may be short; what it must not do is silently shrink.
 */
export function receiveIdProviderNames(result: Result<IdProviderName[], AppError>): void {
  result.match(
    (items) => $idProviderNames.set({ status: 'ready', items }),
    (error) =>
      $idProviderNames.set({ ...$idProviderNames.get(), status: 'error', error: error.message }),
  );
}

export function beginIdProviderUserCountsLoad(): void {
  $idProviderUserCounts.setKey('status', 'loading');
}

/** ! Keeps what it has on a failed read, for the reason `receiveIdProviderNames` explains. */
export function receiveIdProviderUserCounts(result: Result<IdProviderUserCount[], AppError>): void {
  result.match(
    (items) => $idProviderUserCounts.set({ status: 'ready', items }),
    (error) =>
      $idProviderUserCounts.set({
        ...$idProviderUserCounts.get(),
        status: 'error',
        error: error.message,
      }),
  );
}
