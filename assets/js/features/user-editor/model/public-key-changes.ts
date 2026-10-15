import type { PublicKey } from '../../../entities/principal';
import type { UserForm } from './user-form';

export type PublicKeyRowState = 'stored' | 'removed' | 'pending';

/** A row of the keys list: one the user has, one the save will revoke, or one the save will add. */
export type PublicKeyRow = {
  id: string;
  state: PublicKeyRowState;
  kid?: string;
  label?: string;
  creationTime?: string;
  publicKey?: string;
};

export type PublicKeyChangeCounts = {
  added: number;
  removed: number;
};

/**
 * The stored keys first, each marked with what the save will do to it, then the ones waiting to be
 * written. A revoked key keeps its place rather than vanishing: until the save there is nothing to
 * tell it apart from a key that was never there.
 */
export function visiblePublicKeys(
  stored: readonly PublicKey[],
  form: UserForm,
): readonly PublicKeyRow[] {
  const removals = new Set(form.keyRemovals);

  return [
    ...stored.map(({ kid, label, creationTime, publicKey }) => ({
      id: kid,
      state: removals.has(kid) ? ('removed' as const) : ('stored' as const),
      kid,
      label,
      creationTime,
      publicKey,
    })),
    ...form.keyAdditions.map(({ id, label, publicKey }) => ({
      id,
      state: 'pending' as const,
      label,
      publicKey,
    })),
  ];
}

// ! Counts only. The summary reports how many keys move, never the material of any of them.
export function publicKeyChangeCounts(form: UserForm): PublicKeyChangeCounts {
  return { added: form.keyAdditions.length, removed: form.keyRemovals.length };
}

export function hasPublicKeyChanges(form: UserForm): boolean {
  return form.keyAdditions.length > 0 || form.keyRemovals.length > 0;
}
