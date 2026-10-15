import { atom } from 'nanostores';

import {
  DEFAULT_SORT_DIRECTION,
  type SortDirection,
} from '../../../widgets/browse-list/browse-sort';

export const $idProvidersSort = atom<SortDirection>(DEFAULT_SORT_DIRECTION);

export function setIdProvidersSort(direction: SortDirection): void {
  $idProvidersSort.set(direction);
}
