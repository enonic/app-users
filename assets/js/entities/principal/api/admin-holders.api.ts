import { AppError } from '@enonic/ui-utils';
import { err, ok, type ResultAsync } from 'neverthrow';

import { requestGraphQl, type GraphQlRoot } from '../../../shared/api';

/** Asked for beside the bootstrap's own roots, and alone whenever principals change. */
export const ADMIN_HOLDERS_ROOT: GraphQlRoot = { field: 'adminHolders' };

export type AdminHoldersData = { adminHolders: string[] | null };

export function fetchAdminHolders(signal?: AbortSignal): ResultAsync<string[], AppError> {
  return requestGraphQl<AdminHoldersData>(ADMIN_HOLDERS_ROOT, { signal }).andThen(
    ({ adminHolders }) =>
      adminHolders == null
        ? err(new AppError('The holders of the administrator role could not be read'))
        : ok(adminHolders),
  );
}
