import type { ReactNode } from 'react';

import { type Group, idProviderOf, principalName } from '../../../entities/principal';
import type { BrowseRow } from '../../../widgets/browse-list/browse-list';

export function toGroupRow(group: Group, icon?: ReactNode): BrowseRow {
  return {
    key: group.key,
    title: group.displayName,
    subtitle: principalName(group.key),
    icon,
    // Provenance, and the last cell by the contract: the provider's name, which the list is ordered by.
    meta: [idProviderOf(group.key)],
  };
}
