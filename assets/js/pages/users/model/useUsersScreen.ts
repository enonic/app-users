import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';

import { forgetUsers } from '../../../entities/principal';
import { $usersQuery, setUsersSearch } from './query.store';
import { usersSearch } from './search.store';
import { usersSelection } from './selection.store';
import { reloadUsersScreen } from './users.screen';

/**
 * ! Three hundred milliseconds, because every keystroke would otherwise be a request: the search runs on
 * ! the server for this section, and the transport sends one request at a time. Long enough to swallow
 * ! typing, short enough not to feel stalled.
 */
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Reloads the screen whenever what is asked of the server changes.
 *
 * The query store is the single trigger: the search box writes into it (debounced), the filter and the
 * sort write into it directly, and any change means a new first page — offsets from the old query would
 * point into a different result set.
 */
export function useUsersScreen(): void {
  const query = useStore(usersSearch.$query);
  const asked = useStore($usersQuery);

  useEffect(() => {
    const timer = setTimeout(() => setUsersSearch(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    /*
     * ! The ticks go with the query. An action reaches only the rows on screen, and a server-side query
     * ! change replaces every row — so ticks made on a page the new query does not return would stay in
     * ! the store, invisible, and silently shrink what `Delete` applies to. The client-side sections can
     * ! keep them, because there the hidden rows come back when the query clears; here they do not.
     */
    usersSelection.clear();
    void reloadUsersScreen();
  }, [asked.search, asked.idProviders, asked.sort]);

  /*
   * The cached details go with the section: a key loaded here means nothing once the list is left.
   *
   * Leaving is safe whatever order these hooks are called in — this cleanup, the debounce timer's and
   * `useBrowseSection`'s `clearUsersQuery` all run synchronously in the same unmount, so a pending
   * keystroke cannot write the query back after it was cleared.
   */
  useEffect(() => forgetUsers, []);
}
