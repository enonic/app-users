import { allowsWrite, type PrincipalWrite } from './id-provider-mode';
import type { IdProviderNamesState } from './id-providers.store';
import type { IdProviderMode, PrincipalKey } from './principal.types';

export type PrincipalLock = {
  locked: boolean;
  /** Why, as a phrase key; absent while the providers are still loading and nothing can be said. */
  reasonKey?: string;
};

/**
 * ! Fail-closed: a provider not loaded yet, or whose application is gone, locks the edit as well. The
 * ! memberships stay open — they live on the role and the group, which the Roles section writes too.
 */
export function principalLock(
  mode: IdProviderMode | undefined,
  providers: IdProviderNamesState['status'],
  write: PrincipalWrite,
): PrincipalLock {
  if (allowsWrite(mode, write)) {
    return { locked: false };
  }

  if (mode === 'UNAVAILABLE') {
    return { locked: true, reasonKey: 'principal.details.lockedUnavailable' };
  }

  if (mode !== undefined) {
    return { locked: true, reasonKey: 'principal.details.lockedExternal' };
  }

  return providers === 'error'
    ? { locked: true, reasonKey: 'principal.details.lockedProvidersFailed' }
    : { locked: true };
}

/**
 * Whether a panel whose edit buttons follow the lock has anything to follow yet: a principal shown
 * before the providers are known would flash locked. A re-read of the list keeps what it has and does
 * not count.
 */
export function principalLockPending(providers: IdProviderNamesState): boolean {
  return providers.status === 'loading' && providers.items.length === 0;
}

/**
 * Whether the caller is kept from a principal because it holds `role:system.admin`: only an
 * administrator may change such a user or delete it, or change the members of such a group or of the
 * role. Open for a principal not created yet, which holds nothing.
 */
export function administratorLock(
  key: PrincipalKey | undefined,
  holders: ReadonlySet<string>,
  administrator: boolean,
): PrincipalLock {
  return !administrator && key !== undefined && holders.has(key)
    ? { locked: true, reasonKey: 'principal.details.lockedAdministrator' }
    : { locked: false };
}
