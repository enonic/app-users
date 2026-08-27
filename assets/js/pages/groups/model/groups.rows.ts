import type { ReactNode } from 'react';

import { type Group, principalName } from '../../../entities/principal';
import type { BrowseRow } from '../../../widgets/browse-list/browse-list';

export function toGroupRow(
  group: Group,
  icon?: ReactNode,
  // Resolved by the page from the loaded providers: a key carries the provider's name, and the cell
  // shows the name an administrator recognises.
  providerName?: (key: Group['key']) => string | undefined,
): BrowseRow {
  const provider = providerName?.(group.key);

  return {
    key: group.key,
    title: group.displayName,
    subtitle: principalName(group.key),
    icon,
    // Provenance, and the last cell by the contract: which provider the group comes from.
    meta: provider === undefined ? undefined : [provider],
  };
}
