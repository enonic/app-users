import { Form } from '@enonic/input-types/schema';
import type { FormJson } from '@enonic/ui-types';
import { ok, Result, type ResultAsync } from 'neverthrow';

import {
  AppError,
  requestGraphQl,
  requestGraphQlDocument,
  type GraphQlRoot,
} from '../../../shared/api';
import type { IdProviderApplication } from '../model/application.types';

const ID_PROVIDER_APPLICATIONS_SELECTION = `{
  key
  displayName
  hasConfig
  icon
}`;

export const ID_PROVIDER_APPLICATIONS_ROOT: GraphQlRoot = {
  field: 'idProviderApplications',
  selection: ID_PROVIDER_APPLICATIONS_SELECTION,
};

type IdProviderApplicationDto = Omit<IdProviderApplication, 'icon'> & { icon: string | null };

type IdProviderApplicationsResult = { idProviderApplications: IdProviderApplicationDto[] };

export function fetchIdProviderApplications(
  signal?: AbortSignal,
): ResultAsync<IdProviderApplication[], AppError> {
  return requestGraphQl<IdProviderApplicationsResult>(ID_PROVIDER_APPLICATIONS_ROOT, {
    signal,
  }).map(({ idProviderApplications }) =>
    idProviderApplications.map(({ icon, ...rest }) => (icon == null ? rest : { ...rest, icon })),
  );
}

const ID_PROVIDER_FORM_DOCUMENT = `
  query IdProviderForm($application: String!, $locale: String) {
    idProviderForm(application: $application, locale: $locale)
  }
`;

/**
 * The config form the application declares for the providers bound to it, labels in `locale`. `undefined`
 * when the application is no id provider — uninstalled since the list was read, say.
 */
export function fetchIdProviderForm(
  application: string,
  locale: string,
  signal?: AbortSignal,
): ResultAsync<Form | undefined, AppError> {
  return requestGraphQlDocument<{ idProviderForm: FormJson | null }>(
    ID_PROVIDER_FORM_DOCUMENT,
    { application, locale },
    signal,
  ).andThen(({ idProviderForm }) =>
    idProviderForm == null ? ok(undefined) : parseForm(idProviderForm, application),
  );
}

// ! A throw inside `ResultAsync.map` rejects the promise instead of failing the result, which would leave
// ! a load that never settles; a form the parser refuses is a failed read like any other.
const parseForm = Result.fromThrowable(
  (json: FormJson, application: string): Form => Form.fromJson(json, application),
  (cause) => new AppError('The config form could not be read', cause),
);
