import { atom } from 'nanostores';

import {
  DEFAULT_SORT_DIRECTION,
  type SortDirection,
} from '../../../widgets/browse-list/browse-sort';

export const $rolesSort = atom<SortDirection>(DEFAULT_SORT_DIRECTION);

export function setRolesSort(direction: SortDirection): void {
  $rolesSort.set(direction);
}
