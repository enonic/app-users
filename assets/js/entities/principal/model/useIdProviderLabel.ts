import { useStore } from '@nanostores/preact';
import { useCallback } from 'preact/hooks';

import { $idProviderNameByKey } from './id-providers.store';
import { idProviderOf } from './principal.keys';
import type { PrincipalKey } from './principal.types';

export type IdProviderLabel = {
  primary: string;
  secondary?: string;
};

export type IdProviderLabelOptions = {
  /** Keep the provider name on the second line even when it only differs from the display name by case. */
  alwaysShowName?: boolean;
};

/**
 * Both halves of a provider's identity, as a list column shows them: the display name over the name.
 *
 * ! The lists order by the **name** — `userStoreKey` is the only provider field a user node carries, and
 * ! no sort expression reaches the provider's own node — while the display name is what an administrator
 * ! recognises. A column showing one and ordered by the other reads as unordered, so it shows both.
 *
 * The second line is dropped where it differs from the first in case alone: `derivePrincipalName`
 * lowercases, so a one-word display name always derives the name it would sit above. It survives for
 * anything the derivation actually changed — `Azure AD` over `azure.ad`.
 *
 * One line is also all there is for a provider whose display name is empty, one the loaded list does not
 * carry, and every row while the providers are still loading.
 */
export function idProviderLabel(
  name: string,
  displayName: string | undefined,
  { alwaysShowName = false }: IdProviderLabelOptions = {},
): IdProviderLabel {
  if (displayName === undefined) {
    return { primary: name };
  }

  return !alwaysShowName && displayName.toLowerCase() === name.toLowerCase()
    ? { primary: displayName }
    : { primary: displayName, secondary: name };
}

/** `undefined` where the key names no provider at all, which a role does. */
export function useIdProviderLabel(
  options?: IdProviderLabelOptions,
): (key: PrincipalKey) => IdProviderLabel | undefined {
  const names = useStore($idProviderNameByKey);
  const alwaysShowName = options?.alwaysShowName;

  return useCallback(
    (key: PrincipalKey) => {
      const provider = idProviderOf(key);
      return provider === undefined
        ? undefined
        : idProviderLabel(provider, names.get(provider), { alwaysShowName });
    },
    [names, alwaysShowName],
  );
}
