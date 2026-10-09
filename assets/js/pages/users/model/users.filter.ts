import type { FilterField } from '@enonic/ui-kit';
import { ShieldLock } from 'lucide-react';

import { SYSTEM_ID_PROVIDER, type IdProviderUserCount } from '../../../entities/principal';

export const ID_PROVIDER_FIELD = 'idProvider';

/**
 * The one field this section filters by: the id provider, one value per provider in the order the
 * provider list is — minus the system store, whose users this section does not list: they are the
 * Service Accounts section's, so a value here could only ever narrow the list to nothing.
 *
 * ! The count is the provider's total under the current search, not what the loaded page holds: the rows
 * ! are one page of a server-side search, so a provider absent from this page still has users to offer.
 * ! `findUsers` reports one total for the query as a whole, which is why the number comes from
 * ! `IdProvider.users(search)` instead.
 *
 * There is no search helper beside this one: `findUsers` does the matching, so nothing filters on the
 * client. See `pages/users/model/query.store.ts` for what is asked of the server instead.
 */
export function providerField(
  providers: readonly IdProviderUserCount[],
  label: string,
  { notice, loading }: Pick<FilterField, 'notice' | 'loading'> = {},
): FilterField {
  return {
    id: ID_PROVIDER_FIELD,
    label,
    icon: ShieldLock,
    notice,
    loading,
    values: providers
      .filter(({ key }) => key !== SYSTEM_ID_PROVIDER)
      .map(({ key, displayName, users }) => ({ id: key, label: displayName, count: users })),
  };
}
