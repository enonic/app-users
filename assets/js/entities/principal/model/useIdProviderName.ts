import { useStore } from '@nanostores/preact';
import { useCallback } from 'preact/hooks';

import { $idProviderNameByKey } from './id-providers.store';
import { idProviderOf } from './principal.keys';
import type { PrincipalKey } from './principal.types';

/**
 * Names the provider a principal comes from, as an administrator recognises it.
 *
 * Falls back to the name in the key while the providers are still loading, or when the key names one
 * the list does not carry — a stale name reads better than an empty cell, and a role has no provider
 * at all, which stays undefined.
 *
 * Stable while the provider names are: a page feeds this to a `useMemo` that builds its filter entries,
 * and a fresh closure per render would make that memo dead.
 */
export function useIdProviderName(): (key: PrincipalKey) => string | undefined {
  const names = useStore($idProviderNameByKey);

  return useCallback(
    (key: PrincipalKey) => {
      const provider = idProviderOf(key);
      return provider === undefined ? undefined : (names.get(provider) ?? provider);
    },
    [names],
  );
}
