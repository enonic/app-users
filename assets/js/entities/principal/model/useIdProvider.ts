import { useStore } from '@nanostores/preact';

import { $idProviders } from './id-providers.store';
import type { IdProvider } from './principal.types';

/** Reads what is already loaded — the section page owns the loading. */
export function useIdProvider(key: string | undefined): IdProvider | undefined {
  const { items } = useStore($idProviders);

  if (key === undefined) {
    return undefined;
  }

  return items.find((provider) => provider.key === key);
}
