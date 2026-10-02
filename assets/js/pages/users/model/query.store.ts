import { map } from 'nanostores';

import { DEFAULT_PRINCIPAL_SORT, type PrincipalSort } from '../../../entities/principal';
import { textOf, valuesOf, type FilterQuery } from '../../../shared/filter';
import { ID_PROVIDER_FIELD } from './users.filter';

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
  const next = needle.length === 0 ? undefined : needle;
  if (next !== $usersQuery.get().search) {
    $usersQuery.setKey('search', next);
  }
}

/** Only on a change: the effect that reloads the screen keys on the array, and a fresh equal one would reload. */
export function setUsersIdProviders(idProviders: readonly string[]): void {
  const current = $usersQuery.get().idProviders;
  if (
    current.length === idProviders.length &&
    current.every((key, at) => key === idProviders[at])
  ) {
    return;
  }

  $usersQuery.setKey('idProviders', [...idProviders]);
}

/** What the filter holds, as the two things the server is asked to narrow by. */
export function applyUsersFilter(query: FilterQuery): void {
  setUsersSearch(textOf(query));
  setUsersIdProviders([...valuesOf(query, ID_PROVIDER_FIELD)]);
}

export function setUsersSort(sort: PrincipalSort): void {
  $usersQuery.setKey('sort', sort);
}

export function clearUsersQuery(): void {
  $usersQuery.set({ idProviders: [], sort: DEFAULT_PRINCIPAL_SORT });
}
