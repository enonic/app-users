import type { ResultAsync } from 'neverthrow';

import {
  ID_PROVIDER_USER_COUNTS_ROOT,
  USERS_ROOT,
  type IdProviderUserCountsData,
  type UsersData,
} from '../../../entities/principal';
import {
  requestGraphQlRoots,
  type AppError,
  type GraphQlRootsAnswer,
  type GraphQlVariables,
} from '../../../shared/api';

/**
 * Everything the Users screen reads, in one request: a page of users, and the id providers the rows and
 * the filter name.
 *
 * The providers are the whole list every time — there are a handful, and the filter must offer one the
 * current page happens not to contain. The users are one page, narrowed and ordered by the server.
 */
export type UsersScreenData = UsersData & IdProviderUserCountsData;

export type UsersPageQuery = {
  start: number;
  count: number;
  search?: string;
  idProviders: readonly string[];
  sort: 'displayNameAsc' | 'displayNameDesc';
};

export function fetchUsersScreen(
  query: UsersPageQuery,
  signal?: AbortSignal,
): ResultAsync<GraphQlRootsAnswer<UsersScreenData>, AppError> {
  return requestGraphQlRoots<UsersScreenData>(
    [USERS_ROOT, ID_PROVIDER_USER_COUNTS_ROOT],
    'UsersScreen',
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
function valuesFor(query: UsersPageQuery): GraphQlVariables {
  return {
    start: query.start,
    count: query.count,
    search: query.search ?? null,
    idProviders: query.idProviders.length === 0 ? null : query.idProviders,
    sort: query.sort,
  };
}
