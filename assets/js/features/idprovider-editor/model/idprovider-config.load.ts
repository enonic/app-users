import type { PropertyTreeJson } from '@enonic/ui-types';
import { okAsync, type ResultAsync } from 'neverthrow';

import { fetchIdProviderForm } from '../../../entities/application';
import { fetchIdProviderConfig } from '../../../entities/principal';
import type { AppError } from '../../../shared/api';
import { $locale } from '../../../shared/i18n';
import {
  beginIdProviderConfigLoad,
  failIdProviderConfigLoad,
  receiveIdProviderConfig,
  receiveNoIdProviderConfig,
} from './idprovider-config.store';

export type IdProviderConfigRequest = {
  application: string;
  /** The provider being edited, whose stored configuration is the starting point. */
  idProvider?: string;
};

export function loadIdProviderConfig(request: IdProviderConfigRequest, signal: AbortSignal): void {
  const { application } = request;
  beginIdProviderConfigLoad(application);

  void fetchIdProviderForm(application, $locale.get(), signal)
    .andThen((form) =>
      form === undefined
        ? okAsync(undefined)
        : storedConfig(request, signal).map((stored) => ({ form, stored })),
    )
    .match(
      (loaded) => {
        if (signal.aborted) {
          return;
        }
        if (loaded === undefined) {
          receiveNoIdProviderConfig(application);
        } else {
          receiveIdProviderConfig(application, loaded.form, loaded.stored);
        }
      },
      () => {
        if (!signal.aborted) {
          failIdProviderConfigLoad(application);
        }
      },
    );
}

// ! A tree stored for another application is not this one's: the binding changed in the wizard, and the
// ! save starts the new one from its form's defaults.
function storedConfig(
  { application, idProvider }: IdProviderConfigRequest,
  signal: AbortSignal,
): ResultAsync<PropertyTreeJson, AppError> {
  if (idProvider === undefined) {
    return okAsync([]);
  }

  return fetchIdProviderConfig(idProvider, signal).map((stored) =>
    stored?.application === application ? stored.config : [],
  );
}
