import type { ReactNode } from 'react';

import type { User } from '../../../entities/principal';
import type { BrowseRow } from '../../../widgets/browse-list/browse-list';

// No provider cell: every row is the system store's, so naming it would repeat the section's title.
export function toServiceAccountRow(user: User, icon?: ReactNode): BrowseRow {
  return {
    key: user.key,
    title: user.displayName,
    // The user name goes under the display name, not the key as a path — as on the Users screen.
    subtitle: user.login,
    icon,
  };
}
