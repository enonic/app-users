import { useStore } from '@nanostores/preact';
import { useMemo } from 'preact/hooks';

import {
  DEFAULT_PRINCIPAL_SORT,
  useGroups,
  useIdProviderName,
  type PrincipalSort,
} from '../../entities/principal';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import { GroupEditorDialog } from '../../features/group-editor/ui/GroupEditorDialog';
import { isReadOnlyMode } from '../../shared/config';
import { textOf, valuesOf } from '../../shared/filter';
import { useHostFrame, useItemId } from '../../shared/host';
import { useI18n } from '../../shared/i18n';
import { BrowseSort, type BrowseSortOption } from '../../widgets/browse-list/BrowseSort';
import { BrowseScreen } from '../../widgets/browse-screen/BrowseScreen';
import { useBrowseSection } from '../../widgets/browse-screen/useBrowseSection';
import { ManagedModeBanner } from '../../widgets/browse-toolbar/ManagedModeBanner';
import { GroupDeleteDialog } from './GroupDeleteDialog';
import { GroupsItemPage } from './GroupsItemPage';
import { groupsFilter } from './model/filter.store';
import { GROUP_ACTIONS } from './model/groups.actions';
import {
  filterByIdProvider,
  ID_PROVIDER_FIELD,
  idProviderField,
  searchGroups,
} from './model/groups.filter';
import { toGroupRow } from './model/groups.rows';
import { loadGroupsScreen } from './model/groups.screen';
import { sortGroups } from './model/groups.sort';
import { groupsSelection } from './model/selection.store';
import { $groupsSort, setGroupsSort } from './model/sort.store';
import { useGroupsScreen } from './model/useGroupsScreen';

const GROUPS_PAGE_NAME = 'GroupsPage';

export function GroupsPage() {
  // One request for both domains: the groups, and the providers whose display names the filter shows — a
  // group key carries only the provider's name.
  useGroupsScreen();
  const { openItem, closeItem } = useHostFrame();
  const activeKey = useItemId();
  const { status, items } = useGroups();
  const providerName = useIdProviderName();
  const query = useStore(groupsFilter.$query);
  const sort = useStore($groupsSort);

  const sortNameLabel = useI18n('groups.sort.name');
  const sortNameAscLabel = useI18n('groups.sort.nameAsc');
  const sortNameDescLabel = useI18n('groups.sort.nameDesc');
  const sortProviderLabel = useI18n('groups.sort.idProvider');
  const sortProviderAscLabel = useI18n('groups.sort.idProviderAsc');
  const sortProviderDescLabel = useI18n('groups.sort.idProviderDesc');
  const providerFieldLabel = useI18n('groups.filter.idProvider');
  const emptyLabel = useI18n('groups.list.empty');
  const filterPlaceholder = useI18n('groups.filter.placeholder');
  const readOnlyTitle = useI18n('readOnly.title');
  const readOnlyHelp = useI18n('readOnly.help');

  const sortOptions = useMemo(
    () => [
      { id: 'displayNameAsc', label: sortNameAscLabel, field: sortNameLabel, direction: 'asc' },
      { id: 'displayNameDesc', label: sortNameDescLabel, field: sortNameLabel, direction: 'desc' },
      {
        id: 'idProviderAsc',
        label: sortProviderAscLabel,
        field: sortProviderLabel,
        direction: 'asc',
      },
      {
        id: 'idProviderDesc',
        label: sortProviderDescLabel,
        field: sortProviderLabel,
        direction: 'desc',
      },
    ],
    [],
  ) satisfies readonly BrowseSortOption<PrincipalSort>[];

  // Shared with the field's counts below, so the text runs once per render rather than twice.
  const searched = useMemo(() => searchGroups(items, textOf(query)), [items, query]);

  // Narrow first, order last.
  const visible = useMemo(
    () => sortGroups(filterByIdProvider(searched, valuesOf(query, ID_PROVIDER_FIELD)), sort),
    [searched, query, sort],
  );

  // Counts follow the text but not the picked providers, so the filter shrinks with the search rather
  // than restating the current narrowing.
  const fields = useMemo(
    () => [idProviderField(items, searched, providerName, providerFieldLabel)],
    [items, searched, providerName, providerFieldLabel],
  );

  const section = useBrowseSection({
    activeKey,
    openItem,
    closeItem,
    items,
    status,
    selection: groupsSelection,
    filter: groupsFilter,
    visible,
    // A fresh icon element per row: Preact writes into a vnode as it renders it.
    toRow: (group) => toGroupRow(group, <PrincipalIcon principal={group} />),
    reload: () => void loadGroupsScreen(),
  });

  return (
    <div data-component={GROUPS_PAGE_NAME} className="flex min-h-0 min-w-0 flex-1 flex-col">
      <BrowseScreen
        {...section}
        actions={GROUP_ACTIONS}
        managedMode={isReadOnlyMode()}
        notice={<ManagedModeBanner title={readOnlyTitle} help={readOnlyHelp} />}
        emptyLabel={emptyLabel}
        filterPlaceholder={filterPlaceholder}
        details={<GroupsItemPage />}
        fields={fields}
        sort={
          <BrowseSort
            options={sortOptions}
            value={sort}
            onChange={setGroupsSort}
            defaultValue={DEFAULT_PRINCIPAL_SORT}
          />
        }
      />

      <GroupEditorDialog onSaved={() => void loadGroupsScreen()} />
      <GroupDeleteDialog activeKey={section.activeKey} onCloseItem={closeItem} />
    </div>
  );
}

GroupsPage.displayName = GROUPS_PAGE_NAME;
