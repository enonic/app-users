import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';

import { forgetServiceAccounts } from '../../../entities/principal';
import { $serviceAccountsQuery } from './query.store';
import { serviceAccountsSelection } from './selection.store';
import { reloadServiceAccountsScreen } from './service-accounts.screen';

/**
 * Reloads the screen whenever what is asked of the server changes.
 *
 * The query store is the single trigger: it is computed from the filter's terms and the sort, and any
 * change means a new first page — offsets from the old query would point into a different result set.
 */
export function useServiceAccountsScreen(): void {
  const asked = useStore($serviceAccountsQuery);

  useEffect(() => {
    /*
     * ! The ticks go with the query. An action reaches only the rows on screen, and a server-side query
     * ! change replaces every row — so ticks made on a page the new query does not return would stay in
     * ! the store, invisible, and silently shrink what `Delete` applies to.
     */
    serviceAccountsSelection.clear();
    void reloadServiceAccountsScreen();
  }, [asked]);

  /*
   * The cached details go with the section: a key loaded here means nothing once the list is left.
   *
   * Leaving is safe whatever order these hooks are called in — this cleanup and `useBrowseSection`'s
   * `clearServiceAccountsQuery` run synchronously in the same unmount.
   */
  useEffect(() => forgetServiceAccounts, []);
}
