import { createDetailLoader } from '../../../shared/detail';
import { fetchUserDetail, fetchUserMemberships } from '../api/users.api';
import type { UserDetail } from './principal.types';
import { $users } from './users.store';

/**
 * The Users details panel, loaded by key — the Users list is paged, so the selected user may not be
 * among the loaded rows.
 *
 * The debounce, the cancelling and the cache are `shared/detail`'s. What is domain-specific is which of
 * two reads answers, and there is no `*.store.ts` beside this file because the store is the loader's.
 */
const loader = createDetailLoader<UserDetail>({
  /**
   * Asks for what the panel is actually missing.
   *
   * The row the list holds already carries every scalar the panel shows, so the common case reads only
   * the memberships and completes the row with them. A row the loaded page does not carry — a link
   * opened straight at a key, or a search that has narrowed past it — needs the user as well, and only
   * then is the whole thing read.
   */
  load: (key, signal) => {
    const row = $users.get().items.find((user) => user.key === key);

    return row === undefined
      ? fetchUserDetail(key, false, signal)
      : fetchUserMemberships(row, false, signal);
  },
});

export const $userDetail = loader.$detail;

export const showUser = loader.show;

export const forgetUsers = loader.forget;

export const forgetUserDetails = loader.invalidate;
