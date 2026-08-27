import type { ResultAsync } from 'neverthrow';

import {
  ID_PROVIDER_NAMES_ROOT,
  ROLES_ROOT,
  type IdProviderNamesData,
  type RolesData,
} from '../../../entities/principal';
import { requestGraphQlRoots, type AppError, type GraphQlRootsAnswer } from '../../../shared/api';

/**
 * Everything the Roles screen reads, in one request.
 *
 * Two domains meet here and nowhere below: the roles themselves and the id providers that name where a
 * member comes from. Entity slices may not import each other, so this is the lowest layer where the two
 * can be asked for together — and asking together is what makes the screen one round trip instead of
 * two on an engine that serves this app one request at a time.
 *
 * Only the composition lives here. Every selection and every wire shape stays in the api file of the
 * domain that owns it; this file names no field of its own.
 */
export type RolesScreenData = RolesData & IdProviderNamesData;

export function fetchRolesScreen(
  signal?: AbortSignal,
): ResultAsync<GraphQlRootsAnswer<RolesScreenData>, AppError> {
  return requestGraphQlRoots<RolesScreenData>([ROLES_ROOT, ID_PROVIDER_NAMES_ROOT], 'RolesScreen', {
    signal,
  });
}
