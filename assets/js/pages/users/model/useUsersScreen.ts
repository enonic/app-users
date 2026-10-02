import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';

import { forgetUsers } from '../../../entities/principal';
import { usersFilter } from './filter.store';
import { $usersQuery, applyUsersFilter } from './query.store';
import { usersSelection } from './selection.store';
import { reloadUsersScreen } from './users.screen';

/**
 * Reloads the screen whenever what is asked of the server changes.
 *
 * The query store is the single trigger: the filter writes into it as its terms change, the sort writes
 * into it directly, and any change means a new first page — offsets from the old query would point into
 * a different result set. No debounce: a term is committed, not typed, so a keystroke is never a request.
 */
export function useUsersScreen(): void {
  const query = useStore(usersFilter.$query);
  const asked = useStore($usersQuery);

  useEffect(() => {
    applyUsersFilter(query);
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
   * Leaving is safe whatever order these hooks are called in — this cleanup and `useBrowseSection`'s
   * `clearUsersQuery` run synchronously in the same unmount.
   */
  useEffect(() => forgetUsers, []);
}
