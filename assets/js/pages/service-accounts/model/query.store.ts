import { map } from 'nanostores';

import type { SortDirection } from '../../../widgets/browse-list/browse-sort';

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

export const $serviceAccountsQuery = map<ServiceAccountsQueryState>({ sort: 'displayNameAsc' });

export function setServiceAccountsSearch(search: string): void {
  const needle = search.trim();
  $serviceAccountsQuery.setKey('search', needle.length === 0 ? undefined : needle);
}

export function setServiceAccountsSort(direction: SortDirection): void {
  $serviceAccountsQuery.setKey('sort', direction === 'desc' ? 'displayNameDesc' : 'displayNameAsc');
}

export function sortDirectionOf({ sort }: ServiceAccountsQueryState): SortDirection {
  return sort === 'displayNameDesc' ? 'desc' : 'asc';
}

export function clearServiceAccountsQuery(): void {
  $serviceAccountsQuery.set({ sort: 'displayNameAsc' });
}
