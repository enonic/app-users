import { textOf, valuesOf } from '@enonic/ui-kit';
import { atom, computed, type ReadableAtom } from 'nanostores';

import { DEFAULT_PRINCIPAL_SORT, type PrincipalSort } from '../../../entities/principal';
import { usersFilter } from './filter.store';
import { ID_PROVIDER_FIELD } from './users.filter';

/** One request's worth of users. Fifty is what a screen shows without asking for a second page. */
export const PAGE_SIZE = 50;

/**
 * What the server is asked to narrow by.
 *
 * ! Users is the only section where the search, the filter and the order are query parameters rather than
 * ! client-side predicates, so they are read as one store: every change to any of them invalidates the pages
 * ! loaded so far and starts again from the first. The section stores of the other four hold only what the
 * ! client itself applies.
 */
export type UsersQueryState = {
  search?: string;
  idProviders: readonly string[];
  sort: PrincipalSort;
};

export const $usersSort = atom<PrincipalSort>(DEFAULT_PRINCIPAL_SORT);

export const $usersQuery: ReadableAtom<UsersQueryState> = computed(
  [usersFilter.$query, $usersSort],
  (query, sort) => {
    const search = textOf(query);
    return {
      search: search.length === 0 ? undefined : search,
      idProviders: [...valuesOf(query, ID_PROVIDER_FIELD)],
      sort,
    };
  },
);

export function setUsersSort(sort: PrincipalSort): void {
  $usersSort.set(sort);
}

/** The filter is cleared on leaving by `useBrowseSection`; the order is this section's own. */
export function clearUsersQuery(): void {
  $usersSort.set(DEFAULT_PRINCIPAL_SORT);
}
