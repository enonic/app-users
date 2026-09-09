import type { ReactNode } from 'react';

import type { User } from '../../../entities/principal';
import type { BrowseRow } from '../../../widgets/browse-list/browse-list';

export function toUserRow(
  user: User,
  icon?: ReactNode,
  // Built by the page from the loaded providers: the list is ordered by the provider's name, so the
  // cell shows it under the name an administrator recognises.
  provider?: ReactNode,
): BrowseRow {
  return {
    key: user.key,
    title: user.displayName,
    // The user name goes under the display name, not the key as a path. The platform calls the
    // field `login` in what it returns and `name` in what it takes; it is the same string, and the
    // one the key is built from.
    subtitle: user.login,
    icon,
    meta: provider === undefined ? undefined : [provider],
  };
}
