import { useStore } from '@nanostores/preact';

import { $serviceAccounts, $serviceAccountsHasMore } from './service-accounts.store';
import type { UsersView } from './useUsers';

/** A read. The Service Accounts screen owns the load, since the server does the narrowing and the paging. */
export function useServiceAccounts(): UsersView {
  const state = useStore($serviceAccounts);
  const hasMore = useStore($serviceAccountsHasMore);

  return { ...state, hasMore };
}
