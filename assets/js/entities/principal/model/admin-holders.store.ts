import { atom } from 'nanostores';

/**
 * The key of every principal that holds `role:system.admin`, directly or through groups, the role itself
 * included. A caller without that role may not change them (enonic/xp#12615).
 *
 * ! Empty until read and after a failed read, which locks nothing. That is the safe side here: the
 * ! server and the platform refuse the same writes on their own, so a holder this does not know costs
 * ! a refused save with its reason, never an admitted one.
 */
export const $adminHolders = atom<ReadonlySet<string>>(new Set());

export function receiveAdminHolders(keys: readonly string[]): void {
  $adminHolders.set(new Set(keys));
}
