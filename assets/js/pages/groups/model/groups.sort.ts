import { idProviderOf, type Group, type PrincipalSort } from '../../../entities/principal';
import { sortByDisplayName, sortByValue } from '../../../widgets/browse-list/browse-sort';

export function sortGroups(groups: readonly Group[], sort: PrincipalSort): Group[] {
  switch (sort) {
    case 'displayNameAsc':
      return sortByDisplayName(groups, 'asc');
    case 'displayNameDesc':
      return sortByDisplayName(groups, 'desc');
    case 'idProviderAsc':
      return sortByValue(groups, 'asc', ({ key }) => idProviderOf(key) ?? '');
    case 'idProviderDesc':
      return sortByValue(groups, 'desc', ({ key }) => idProviderOf(key) ?? '');
  }
}
