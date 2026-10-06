import { useStore } from '@nanostores/preact';
import { useCallback } from 'preact/hooks';

import { $idProviderModeByKey } from './id-providers.store';
import { idProviderOf } from './principal.keys';
import type { IdProviderMode, PrincipalKey } from './principal.types';

/** The mode of the provider a principal comes from; undefined until the providers are loaded. */
export function useIdProviderMode(): (key: PrincipalKey) => IdProviderMode | undefined {
  const modes = useStore($idProviderModeByKey);

  return useCallback(
    (key: PrincipalKey) => {
      const provider = idProviderOf(key);
      return provider === undefined ? undefined : modes.get(provider);
    },
    [modes],
  );
}
