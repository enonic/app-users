import { idProviderOf } from '@enonic/ui-utils';
import { useStore } from '@nanostores/preact';

import { isAdministrator } from '../../../shared/config';
import { $adminHolders } from './admin-holders.store';
import type { PrincipalWrite } from './id-provider-mode';
import { $idProviderModeByKey, $idProviderNames } from './id-providers.store';
import { administratorLock, principalLock, type PrincipalLock } from './principal-lock';
import type { PrincipalKey } from './principal.types';

const NOBODY: ReadonlySet<string> = new Set();

/** Whether this app may edit the principal's own fields, by its provider's mode — and why not. */
export function usePrincipalLock(key: PrincipalKey, write: PrincipalWrite): PrincipalLock {
  const modes = useStore($idProviderModeByKey);
  const { status } = useStore($idProviderNames, { keys: ['status'] });

  const provider = idProviderOf(key);
  const mode = provider === undefined ? undefined : modes.get(provider);

  return principalLock(mode, status, write);
}

/** Whether the principal holds `role:system.admin` while the caller does not, and so may not change it. */
export function useAdministratorLock(key: PrincipalKey | undefined): PrincipalLock {
  const holders = useStore($adminHolders);

  return administratorLock(key, holders, isAdministrator());
}

/**
 * The principals whose member lists the caller may not change, and which it may not delete: the holders
 * of `role:system.admin`, or nobody for an administrator.
 */
export function useAdministratorOnly(): ReadonlySet<string> {
  const holders = useStore($adminHolders);

  return isAdministrator() ? NOBODY : holders;
}
