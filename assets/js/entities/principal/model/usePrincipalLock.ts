import { useStore } from '@nanostores/preact';

import type { PrincipalWrite } from './id-provider-mode';
import { $idProviderModeByKey, $idProviderNames } from './id-providers.store';
import { principalLock, type PrincipalLock } from './principal-lock';
import { idProviderOf } from './principal.keys';
import type { PrincipalKey } from './principal.types';

/** Whether this app may edit the principal's own fields, by its provider's mode — and why not. */
export function usePrincipalLock(key: PrincipalKey, write: PrincipalWrite): PrincipalLock {
  const modes = useStore($idProviderModeByKey);
  const { status } = useStore($idProviderNames, { keys: ['status'] });

  const provider = idProviderOf(key);
  const mode = provider === undefined ? undefined : modes.get(provider);

  return principalLock(mode, status, write);
}
