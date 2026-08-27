import { useStore } from '@nanostores/preact';

import { $users, $usersHasMore, type UsersState } from './users.store';

export type UsersView = UsersState & {
  /** Whether `Load more` has anything to ask for. The store decides, never the page. */
  hasMore: boolean;
};

/** A read. The Users screen owns the load, since the server does the narrowing and the paging. */
export function useUsers(): UsersView {
  const state = useStore($users);
  const hasMore = useStore($usersHasMore);

  return { ...state, hasMore };
}
