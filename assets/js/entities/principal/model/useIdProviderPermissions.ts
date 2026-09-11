import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';

import type { DetailState } from '../../../shared/detail';
import { $idProviderPermissions, showIdProviderPermissions } from './id-provider-permissions.load';
import type { IdProviderPermissions } from './principal.types';

/** The access control list of the provider the panel is showing. */
export function useIdProviderPermissions(
  key: string | undefined,
): DetailState<IdProviderPermissions> {
  const state = useStore($idProviderPermissions);

  useEffect(() => {
    showIdProviderPermissions(key);
  }, [key]);

  useEffect(() => () => showIdProviderPermissions(undefined), []);

  return state;
}
