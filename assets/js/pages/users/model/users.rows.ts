import type { ReactNode } from 'react';

import type { User } from '../../../entities/principal';
import type { BrowseRow } from '../../../widgets/browse-list/browse-list';

export function toUserRow(user: User, icon?: ReactNode): BrowseRow {
  return {
    key: user.key,
    title: user.displayName,
    // The user name goes under the display name, not the key as a path. The platform calls the
    // field `login` in what it returns and `name` in what it takes; it is the same string, and the
    // one the key is built from.
    subtitle: user.login,
    icon,
    // Provenance: the provider's name, which the list is ordered by.
    meta: [user.idProvider],
  };
}
