import type { ResultAsync } from 'neverthrow';

import {
  ID_PROVIDER_NAMES_ROOT,
  SYSTEM_ID_PROVIDER,
  USERS_ROOT,
  type IdProviderNamesData,
  type UsersData,
} from '../../../entities/principal';
import {
  requestGraphQlRoots,
  type AppError,
  type GraphQlRootsAnswer,
  type GraphQlVariables,
} from '../../../shared/api';

/**
 * Everything the Service Accounts screen reads: one page of the system store's users, narrowed and
 * ordered by the server — the same root as the Users screen, pinned to the one provider — plus the
 * provider names. There is nothing to filter by, but the details panel names the provider a group
 * membership comes from, and this section may be the first one mounted in a session.
 */
export type ServiceAccountsScreenData = UsersData & IdProviderNamesData;

export type ServiceAccountsPageQuery = {
  start: number;
  count: number;
  search?: string;
  sort: 'displayNameAsc' | 'displayNameDesc';
};

export function fetchServiceAccountsScreen(
  query: ServiceAccountsPageQuery,
  signal?: AbortSignal,
): ResultAsync<GraphQlRootsAnswer<ServiceAccountsScreenData>, AppError> {
  return requestGraphQlRoots<ServiceAccountsScreenData>(
    [USERS_ROOT, ID_PROVIDER_NAMES_ROOT],
    'ServiceAccountsScreen',
    {
      values: valuesFor(query),
      signal,
    },
  );
}

//
// * Helpers
//

// Values only: `USERS_ROOT` declares the types beside the arguments that use them, so nothing here can
// declare a variable the document does not use, or use one it did not declare.
function valuesFor(query: ServiceAccountsPageQuery): GraphQlVariables {
  return {
    start: query.start,
    count: query.count,
    search: query.search ?? null,
    idProviders: [SYSTEM_ID_PROVIDER],
    sort: query.sort,
  };
}
