import { createDetailLoader } from '../../../shared/detail';
import { fetchUserDetail, fetchUserMemberships } from '../api/users.api';
import type { UserDetail } from './principal.types';
import { $serviceAccounts } from './service-accounts.store';

/**
 * The Service Accounts details panel, loaded by key. The same two reads as `user-detail.load.ts` — a
 * service account is a user — but its own loader over its own list: the sections stay mounted side by
 * side, so sharing a cache would let one section's leave or reload drop what the other is showing.
 */
const loader = createDetailLoader<UserDetail>({
  // The row already carries every scalar the panel shows, so the common case reads only the memberships;
  // a key the loaded page does not hold is read whole.
  load: (key, signal) => {
    const row = $serviceAccounts.get().items.find((user) => user.key === key);

    return row === undefined
      ? fetchUserDetail(key, false, signal)
      : fetchUserMemberships(row, false, signal);
  },
});

export const $serviceAccountDetail = loader.$detail;

export const showServiceAccount = loader.show;

export const forgetServiceAccounts = loader.forget;

export const forgetServiceAccountDetails = loader.invalidate;

export const evictServiceAccountDetail = loader.evict;
