import { atom } from 'nanostores';

import {
  DEFAULT_SORT_DIRECTION,
  type SortDirection,
} from '../../../widgets/browse-list/browse-sort';

export const $groupsSort = atom<SortDirection>(DEFAULT_SORT_DIRECTION);

export function setGroupsSort(direction: SortDirection): void {
  $groupsSort.set(direction);
}
