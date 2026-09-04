import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';

import { forgetServiceAccounts } from '../../../entities/principal';
import { $serviceAccountsQuery, setServiceAccountsSearch } from './query.store';
import { serviceAccountsSearch } from './search.store';
import { serviceAccountsSelection } from './selection.store';
import { reloadServiceAccountsScreen } from './service-accounts.screen';

/**
 * ! Three hundred milliseconds, because every keystroke would otherwise be a request: the search runs on
 * ! the server for this section, and the transport sends one request at a time. Long enough to swallow
 * ! typing, short enough not to feel stalled.
 */
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Reloads the screen whenever what is asked of the server changes.
 *
 * The query store is the single trigger: the search box writes into it (debounced) and the sort writes
 * into it directly, and any change means a new first page — offsets from the old query would point into
 * a different result set.
 */
export function useServiceAccountsScreen(): void {
  const query = useStore(serviceAccountsSearch.$query);
  const asked = useStore($serviceAccountsQuery);

  useEffect(() => {
    const timer = setTimeout(() => setServiceAccountsSearch(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    /*
     * ! The ticks go with the query. An action reaches only the rows on screen, and a server-side query
     * ! change replaces every row — so ticks made on a page the new query does not return would stay in
     * ! the store, invisible, and silently shrink what `Delete` applies to.
     */
    serviceAccountsSelection.clear();
    void reloadServiceAccountsScreen();
  }, [asked.search, asked.sort]);

  /*
   * The cached details go with the section: a key loaded here means nothing once the list is left.
   *
   * Leaving is safe whatever order these hooks are called in — this cleanup, the debounce timer's and
   * `useBrowseSection`'s `clearServiceAccountsQuery` all run synchronously in the same unmount, so a
   * pending keystroke cannot write the query back after it was cleared.
   */
  useEffect(() => forgetServiceAccounts, []);
}
