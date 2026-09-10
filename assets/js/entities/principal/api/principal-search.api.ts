import type { ResultAsync } from 'neverthrow';

import { requestGraphQlDocument, type AppError } from '../../../shared/api';
import type { PrincipalPage, PrincipalRef, PrincipalType } from '../model/principal.types';

const PRINCIPAL_SEARCH_DOCUMENT = `
  query PrincipalSearch($types: [PrincipalType!], $idProvider: String, $search: String, $start: Int, $count: Int) {
    principals(types: $types, idProvider: $idProvider, search: $search, start: $start, count: $count) {
      total
      hits {
        key
        type
        displayName
      }
    }
  }
`;

export type PrincipalSearchQuery = {
  types: readonly PrincipalType[];
  idProvider?: string;
  search: string;
  start: number;
  count: number;
};

type PrincipalSearchResult = {
  principals: { total: number; hits: PrincipalRef[] } | null;
};

export function searchPrincipals(
  { types, idProvider, search, start, count }: PrincipalSearchQuery,
  signal?: AbortSignal,
): ResultAsync<PrincipalPage, AppError> {
  return requestGraphQlDocument<PrincipalSearchResult>(
    PRINCIPAL_SEARCH_DOCUMENT,
    {
      types,
      idProvider: nonEmpty(idProvider),
      search: nonEmpty(search.trim()),
      start,
      count,
    },
    signal,
  ).map(({ principals }) =>
    principals == null
      ? { total: 0, items: [] }
      : { total: principals.total, items: principals.hits },
  );
}

function nonEmpty(value?: string): string | undefined {
  return value !== undefined && value.length > 0 ? value : undefined;
}
