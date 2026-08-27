import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';

import { showIdProviderPrincipals } from './id-provider-principals.load';
import {
  $idProviderPrincipals,
  type IdProviderPrincipalsState,
} from './id-provider-principals.store';

/** The users and groups of the provider the panel is showing, a page at a time. */
export function useIdProviderPrincipals(key: string | undefined): IdProviderPrincipalsState {
  const state = useStore($idProviderPrincipals);

  useEffect(() => {
    showIdProviderPrincipals(key);
  }, [key]);

  return state;
}
