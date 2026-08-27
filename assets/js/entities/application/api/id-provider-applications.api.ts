import type { ResultAsync } from 'neverthrow';

import { requestGraphQl, type AppError, type GraphQlRoot } from '../../../shared/api';
import type { IdProviderApplication } from '../model/application.types';

const ID_PROVIDER_APPLICATIONS_SELECTION = `{
  key
  displayName
  hasConfig
}`;

export const ID_PROVIDER_APPLICATIONS_ROOT: GraphQlRoot = {
  field: 'idProviderApplications',
  selection: ID_PROVIDER_APPLICATIONS_SELECTION,
};

type IdProviderApplicationsResult = { idProviderApplications: IdProviderApplication[] };

export function fetchIdProviderApplications(
  signal?: AbortSignal,
): ResultAsync<IdProviderApplication[], AppError> {
  return requestGraphQl<IdProviderApplicationsResult>(ID_PROVIDER_APPLICATIONS_ROOT, {
    signal,
  }).map(({ idProviderApplications }) => idProviderApplications);
}
