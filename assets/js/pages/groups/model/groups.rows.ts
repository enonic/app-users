import type { ReactNode } from 'react';

import { type Group, principalName } from '../../../entities/principal';
import type { BrowseRow } from '../../../widgets/browse-list/browse-list';

export function toGroupRow(
  group: Group,
  icon?: ReactNode,
  // Built by the page from the loaded providers: the list is ordered by the provider's name, so the
  // cell shows it under the name an administrator recognises.
  provider?: ReactNode,
): BrowseRow {
  return {
    key: group.key,
    title: group.displayName,
    subtitle: principalName(group.key),
    icon,
    // Provenance, and the last cell by the contract: which provider the group comes from.
    meta: provider === undefined ? undefined : [provider],
  };
}
