import type { ResultAsync } from 'neverthrow';

import {
  GROUPS_ROOT,
  ID_PROVIDER_NAMES_ROOT,
  type GroupsData,
  type IdProviderNamesData,
} from '../../../entities/principal';
import { requestGraphQlRoots, type AppError, type GraphQlRootsAnswer } from '../../../shared/api';

/**
 * Everything the Groups screen reads, in one request: the groups, and the id providers whose display
 * names the rows and the filter show — a group key carries only the provider's name.
 *
 * Only the composition lives here; every selection and wire shape stays with the domain that owns it.
 */
export type GroupsScreenData = GroupsData & IdProviderNamesData;

export function fetchGroupsScreen(
  signal?: AbortSignal,
): ResultAsync<GraphQlRootsAnswer<GroupsScreenData>, AppError> {
  return requestGraphQlRoots<GroupsScreenData>(
    [GROUPS_ROOT, ID_PROVIDER_NAMES_ROOT],
    'GroupsScreen',
    {
      signal,
    },
  );
}
