import type { ReactNode } from 'react';

import { type Role, principalName } from '../../../entities/principal';
import type { BrowseRow } from '../../../widgets/browse-list/browse-list';

export function toRoleRow(role: Role, icon?: ReactNode): BrowseRow {
  return {
    key: role.key,
    title: role.displayName,
    subtitle: principalName(role.key),
    icon,
  };
}
