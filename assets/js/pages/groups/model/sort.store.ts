import { atom } from 'nanostores';

import { DEFAULT_PRINCIPAL_SORT, type PrincipalSort } from '../../../entities/principal';

export const $groupsSort = atom<PrincipalSort>(DEFAULT_PRINCIPAL_SORT);

export function setGroupsSort(sort: PrincipalSort): void {
  $groupsSort.set(sort);
}
