import type { IdProviderUserCount } from '../../../entities/principal';
import type { BrowseFilterEntry } from '../../../widgets/browse-list/browse-filter';

/**
 * One filter entry per id provider, ordered the way the provider list is.
 *
 * ! The count is the provider's whole user total, not what the loaded page holds: the rows are one page of
 * ! a server-side search, so a provider absent from this page still has users to offer. `findUsers`
 * ! reports one total for the query as a whole, which is why the number comes from `IdProvider.users`.
 *
 * There is no search helper beside this one: `findUsers` does the matching, so nothing filters on the
 * client. See `pages/users/model/query.store.ts` for what is asked of the server instead.
 */
export function providerEntries(providers: readonly IdProviderUserCount[]): BrowseFilterEntry[] {
  return providers.map(({ key, displayName, users }) => ({
    id: key,
    label: displayName,
    count: users,
  }));
}
