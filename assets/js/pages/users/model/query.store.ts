import { map } from 'nanostores';

import type { SortDirection } from '../../../widgets/browse-list/browse-sort';

/** One request's worth of users. Fifty is what a screen shows without asking for a second page. */
export const PAGE_SIZE = 50;

export type UsersSort = 'displayNameAsc' | 'displayNameDesc';

/**
 * What the server is asked to narrow by.
 *
 * ! Users is the only section where the search, the filter and the order are query parameters rather than
 * ! client-side predicates, so they live in one store: every change to any of them invalidates the pages
 * ! loaded so far and starts again from the first. The section stores of the other four hold only what the
 * ! client itself applies.
 */
export type UsersQueryState = {
  search?: string;
  idProviders: readonly string[];
  sort: UsersSort;
};

export const $usersQuery = map<UsersQueryState>({ idProviders: [], sort: 'displayNameAsc' });

export function setUsersSearch(search: string): void {
  const needle = search.trim();
  $usersQuery.setKey('search', needle.length === 0 ? undefined : needle);
}

export function toggleUsersIdProvider(idProvider: string): void {
  const current = $usersQuery.get().idProviders;

  $usersQuery.setKey(
    'idProviders',
    current.includes(idProvider)
      ? current.filter((candidate) => candidate !== idProvider)
      : [...current, idProvider],
  );
}

export function setUsersSort(direction: SortDirection): void {
  $usersQuery.setKey('sort', direction === 'desc' ? 'displayNameDesc' : 'displayNameAsc');
}

export function sortDirectionOf({ sort }: UsersQueryState): SortDirection {
  return sort === 'displayNameDesc' ? 'desc' : 'asc';
}

export function clearUsersQuery(): void {
  $usersQuery.set({ idProviders: [], sort: 'displayNameAsc' });
}
