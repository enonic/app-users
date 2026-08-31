import { useStore } from '@nanostores/preact';
import { useMemo } from 'preact/hooks';

import { useGroups, useIdProviderName } from '../../entities/principal';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import { GroupEditorDialog } from '../../features/group-editor/GroupEditorDialog';
import { useHostFrame } from '../../shared/host';
import { useI18n } from '../../shared/i18n';
import { visibleEntries } from '../../widgets/browse-list/browse-filter';
import { sortByDisplayName, type SortDirection } from '../../widgets/browse-list/browse-sort';
import { BrowseFilter } from '../../widgets/browse-list/BrowseFilter';
import { BrowseSort } from '../../widgets/browse-list/BrowseSort';
import { BrowseScreen } from '../../widgets/browse-screen/BrowseScreen';
import { useBrowseSection } from '../../widgets/browse-screen/useBrowseSection';
import { GroupDeleteDialog } from './GroupDeleteDialog';
import { GroupsItemPage } from './GroupsItemPage';
import { groupsFilter } from './model/filter.store';
import { GROUP_ACTIONS } from './model/groups.actions';
import { filterByIdProvider, idProviderEntries, searchGroups } from './model/groups.filter';
import { toGroupRow } from './model/groups.rows';
import { loadGroupsScreen } from './model/groups.screen';
import { groupsSearch } from './model/search.store';
import { groupsSelection } from './model/selection.store';
import { $groupsSort, setGroupsSort } from './model/sort.store';
import { useGroupsScreen } from './model/useGroupsScreen';

export function GroupsPage() {
  // One request for both domains: the groups, and the providers whose display names the rows show — a
  // group key carries only the provider's name.
  useGroupsScreen();
  const { openItem, closeItem } = useHostFrame();
  const { status, items } = useGroups();
  const providerName = useIdProviderName();
  const query = useStore(groupsSearch.$query);
  const selectedProviders = useStore(groupsFilter.$selected);
  const sort = useStore($groupsSort);

  const sortAscLabel = useI18n('groups.sort.nameAsc');
  const sortDescLabel = useI18n('groups.sort.nameDesc');
  const emptyLabel = useI18n('groups.list.empty');

  const sortOptions = useMemo(
    () => [
      { id: 'asc', label: sortAscLabel },
      { id: 'desc', label: sortDescLabel },
    ],
    [],
  ) satisfies readonly { id: SortDirection; label: string }[];

  // Shared with the filter entries below, so the query runs once per render rather than twice.
  const searched = useMemo(() => searchGroups(items, query), [items, query]);

  // Narrow first, order last.
  const visible = useMemo(
    () => sortByDisplayName(filterByIdProvider(searched, selectedProviders), sort),
    [searched, selectedProviders, sort],
  );

  // Entries follow the query but not the ticked providers, so the filter shrinks with the search
  // rather than restating the current narrowing.
  const entries = useMemo(
    () => visibleEntries(idProviderEntries(items, searched, providerName), selectedProviders),
    [items, searched, selectedProviders, providerName],
  );

  const section = useBrowseSection({
    openItem,
    closeItem,
    items,
    status,
    selection: groupsSelection,
    search: groupsSearch,
    resetOnLeave: [groupsFilter],
    visible,
    // A fresh icon element per row: Preact writes into a vnode as it renders it.
    toRow: (group) => toGroupRow(group, <PrincipalIcon principal={group} />, providerName),
    reload: () => void loadGroupsScreen(),
  });

  return (
    <>
      <BrowseScreen
        {...section}
        actions={GROUP_ACTIONS}
        emptyLabel={emptyLabel}
        details={<GroupsItemPage />}
        filter={
          <BrowseFilter
            entries={entries}
            selected={selectedProviders}
            onToggle={(id) => groupsFilter.toggle(id)}
          />
        }
        sort={<BrowseSort options={sortOptions} value={sort} onChange={setGroupsSort} />}
      />

      <GroupEditorDialog onSaved={() => void loadGroupsScreen()} />
      <GroupDeleteDialog activeKey={section.activeKey} onCloseItem={closeItem} />
    </>
  );
}
