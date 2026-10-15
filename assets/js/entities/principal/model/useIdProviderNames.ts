import { useStore } from '@nanostores/preact';

import { $idProviderNames, type IdProviderNamesState } from './id-providers.store';

/**
 * A read of the provider names, for a section that offers them as a filter and has to say when the
 * list may be short. Whoever needs them owns the load — see `useIdProviders` for the section that
 * shows the providers themselves.
 */
export function useIdProviderNames(): IdProviderNamesState {
  return useStore($idProviderNames);
}
