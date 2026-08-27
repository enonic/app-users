import { useStore } from '@nanostores/preact';
import { useMemo } from 'preact/hooks';

import { useRoles } from '../../entities/principal';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import { RoleEditorDialog } from '../../features/role-editor/RoleEditorDialog';
import { closeItem, openItem } from '../../shared/host';
import { useI18n } from '../../shared/i18n';
import { visibleEntries } from '../../widgets/browse-list/browse-filter';
import { sortByDisplayName, type SortDirection } from '../../widgets/browse-list/browse-sort';
import { BrowseFilter } from '../../widgets/browse-list/BrowseFilter';
import { BrowseSort } from '../../widgets/browse-list/BrowseSort';
import { BrowseScreen } from '../../widgets/browse-screen/BrowseScreen';
import { useBrowseSection } from '../../widgets/browse-screen/useBrowseSection';
import { rolesFilter } from './model/filter.store';
import { ROLE_ACTIONS } from './model/roles.actions';
import { filterRolesByBucket, roleBuckets, searchRoles } from './model/roles.filter';
import { toRoleRow } from './model/roles.rows';
import { loadRolesScreen } from './model/roles.screen';
import { rolesSearch } from './model/search.store';
import { rolesSelection } from './model/selection.store';
import { $rolesSort, setRolesSort } from './model/sort.store';
import { useRolesScreen } from './model/useRolesScreen';
import { RoleDeleteDialog } from './RoleDeleteDialog';
import { RolesItemPage } from './RolesItemPage';

export function RolesPage() {
  // One request for the three domains this screen reads — the roles, the providers that name a member's
  // origin.
  useRolesScreen();
  const { status, items } = useRoles();
  const query = useStore(rolesSearch.$query);
  const selectedBuckets = useStore(rolesFilter.$selected);
  const sort = useStore($rolesSort);

  const sortAscLabel = useI18n('roles.sort.nameAsc');
  const sortDescLabel = useI18n('roles.sort.nameDesc');
  const systemBucketLabel = useI18n('roles.filter.system');
  const customBucketLabel = useI18n('roles.filter.custom');
  const emptyLabel = useI18n('roles.list.empty');

  const sortOptions = useMemo(
    () => [
      { id: 'asc', label: sortAscLabel },
      { id: 'desc', label: sortDescLabel },
    ],
    [],
  ) satisfies readonly { id: SortDirection; label: string }[];

  // Shared with the bucket counts below, so the query runs once per render rather than twice.
  const searched = useMemo(() => searchRoles(items, query), [items, query]);

  // Narrow first, order last: sorting only what survived is the cheaper half, and the order the rows
  // appear in has to be the final word.
  const visible = useMemo(
    () => sortByDisplayName(filterRolesByBucket(searched, selectedBuckets), sort),
    [searched, selectedBuckets, sort],
  );

  // Counts follow the query but not the ticked buckets, so they answer "where did the search find
  // anything" rather than restating the current narrowing.
  const buckets = useMemo(
    () =>
      visibleEntries(
        roleBuckets(items, searched, {
          system: systemBucketLabel,
          custom: customBucketLabel,
        }),
        selectedBuckets,
      ),
    [items, searched, selectedBuckets],
  );

  const section = useBrowseSection({
    openItem,
    closeItem,
    items,
    status,
    selection: rolesSelection,
    search: rolesSearch,
    resetOnLeave: [rolesFilter],
    visible,
    // A fresh icon element per row: Preact writes into a vnode as it renders it.
    toRow: (role) => toRoleRow(role, <PrincipalIcon principal={role} />),
    reload: () => void loadRolesScreen(),
  });

  return (
    <>
      <BrowseScreen
        {...section}
        actions={ROLE_ACTIONS}
        emptyLabel={emptyLabel}
        details={<RolesItemPage />}
        filter={
          <BrowseFilter
            entries={buckets}
            selected={selectedBuckets}
            onToggle={(id) => rolesFilter.toggle(id)}
          />
        }
        sort={<BrowseSort options={sortOptions} value={sort} onChange={setRolesSort} />}
      />

      <RoleEditorDialog onSaved={() => void loadRolesScreen()} />
      <RoleDeleteDialog activeKey={section.activeKey} onCloseItem={closeItem} />
    </>
  );
}
