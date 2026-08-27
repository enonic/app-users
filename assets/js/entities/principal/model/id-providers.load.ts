import { err, ok } from 'neverthrow';

import { fetchIdProviders } from '../api/id-providers.api';
import { beginIdProvidersLoad, receiveIdProviders } from './id-providers.store';

/**
 * The providers with everything their own section shows, for that section alone.
 *
 * Users, Groups and Roles do not use this: they need a name per provider beside their own domain, so
 * those screens ask for `ID_PROVIDER_NAMES_ROOT` in the same document and hand the outcome to
 * `receiveIdProviderNames`.
 *
 * ! Refresh can retrigger the load, so the previous one is cancelled and its answer dropped: without
 * ! this the slower of two requests decides what the list shows.
 */
let pending: AbortController | undefined;

export function loadIdProviders(): Promise<void> {
  pending?.abort();
  const controller = new AbortController();
  pending = controller;
  const { signal } = controller;

  beginIdProvidersLoad();

  return fetchIdProviders(signal).match(
    (items) => {
      if (!signal.aborted) {
        receiveIdProviders(ok(items));
      }
    },
    (error) => {
      if (!signal.aborted) {
        receiveIdProviders(err(error));
      }
    },
  );
}
