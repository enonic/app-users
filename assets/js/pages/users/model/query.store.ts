import { map } from 'nanostores';

import { DEFAULT_PRINCIPAL_SORT, type PrincipalSort } from '../../../entities/principal';

/** One request's worth of users. Fifty is what a screen shows without asking for a second page. */
export const PAGE_SIZE = 50;

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
  sort: PrincipalSort;
};

export const $usersQuery = map<UsersQueryState>({
  idProviders: [],
  sort: DEFAULT_PRINCIPAL_SORT,
});

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

export function setUsersSort(sort: PrincipalSort): void {
  $usersQuery.setKey('sort', sort);
}

export function clearUsersQuery(): void {
  $usersQuery.set({ idProviders: [], sort: DEFAULT_PRINCIPAL_SORT });
}
