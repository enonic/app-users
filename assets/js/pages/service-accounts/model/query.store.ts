import { textOf } from '@enonic/ui-kit';
import { atom, computed, type ReadableAtom } from 'nanostores';

import type { SortDirection } from '../../../widgets/browse-list/browse-sort';
import { serviceAccountsFilter } from './filter.store';

/** One request's worth of service accounts. Fifty is what a screen shows without asking for a second page. */
export const PAGE_SIZE = 50;

export type ServiceAccountsSort = 'displayNameAsc' | 'displayNameDesc';

/**
 * What the server is asked to narrow by — the Users query minus the provider, which is pinned to
 * `system` by the api segment rather than held here: it is the section's identity, not a choice.
 */
export type ServiceAccountsQueryState = {
  search?: string;
  sort: ServiceAccountsSort;
};

export const $serviceAccountsSort = atom<ServiceAccountsSort>('displayNameAsc');

export const $serviceAccountsQuery: ReadableAtom<ServiceAccountsQueryState> = computed(
  [serviceAccountsFilter.$query, $serviceAccountsSort],
  (query, sort) => {
    const search = textOf(query);
    return { search: search.length === 0 ? undefined : search, sort };
  },
);

export function setServiceAccountsSort(direction: SortDirection): void {
  $serviceAccountsSort.set(direction === 'desc' ? 'displayNameDesc' : 'displayNameAsc');
}

export function sortDirectionOf(sort: ServiceAccountsSort): SortDirection {
  return sort === 'displayNameDesc' ? 'desc' : 'asc';
}

/** The filter is cleared on leaving by `useBrowseSection`; the order is this section's own. */
export function clearServiceAccountsQuery(): void {
  $serviceAccountsSort.set('displayNameAsc');
}
