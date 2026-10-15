import { useStore } from '@nanostores/preact';

import { $idProviders, type IdProvidersState } from './id-providers.store';

/**
 * A read. Whoever needs the providers owns the load — its own section through
 * `pages/id-providers/model/useIdProvidersScreen.ts`, and Users, Groups and Roles as part of the one
 * request their screen makes.
 *
 * ! It used to load as well, which cost a second request wherever a screen had already asked for the
 * ! providers alongside its own domain. Hooks read; screens load.
 */
export function useIdProviders(): IdProvidersState {
  return useStore($idProviders);
}
