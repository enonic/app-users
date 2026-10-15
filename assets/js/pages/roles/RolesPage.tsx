import { textOf, valuesOf } from '@enonic/ui-kit';
import { useStore } from '@nanostores/preact';
import { useMemo } from 'preact/hooks';

import { useRoles } from '../../entities/principal';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import { RoleEditorDialog } from '../../features/role-editor/ui/RoleEditorDialog';
import { isReadOnlyMode } from '../../shared/config';
import { useHostFrame, useItemId } from '../../shared/host';
import { useI18n } from '../../shared/i18n';
import {
  DEFAULT_SORT_DIRECTION,
  sortByDisplayName,
  type SortDirection,
} from '../../widgets/browse-list/browse-sort';
import { BrowseSort, type BrowseSortOption } from '../../widgets/browse-list/BrowseSort';
import { BrowseScreen } from '../../widgets/browse-screen/BrowseScreen';
import { useBrowseSection } from '../../widgets/browse-screen/useBrowseSection';
import { ManagedModeBanner } from '../../widgets/browse-toolbar/ManagedModeBanner';
import { rolesFilter } from './model/filter.store';
import { ROLE_ACTIONS } from './model/roles.actions';
import { filterRolesByBucket, SCOPE_FIELD, scopeField, searchRoles } from './model/roles.filter';
import { toRoleRow } from './model/roles.rows';
import { loadRolesScreen } from './model/roles.screen';
import { rolesSelection } from './model/selection.store';
import { $rolesSort, setRolesSort } from './model/sort.store';
import { useRolesScreen } from './model/useRolesScreen';
import { RoleDeleteDialog } from './RoleDeleteDialog';
import { RolesItemPage } from './RolesItemPage';

const ROLES_PAGE_NAME = 'RolesPage';

export function RolesPage() {
  // One request for the three domains this screen reads — the roles, the providers that name a member's
  // origin.
  useRolesScreen();
  const { openItem, closeItem } = useHostFrame();
  const activeKey = useItemId();
  const { status, items } = useRoles();
  const query = useStore(rolesFilter.$query);
  const sort = useStore($rolesSort);

  const sortNameLabel = useI18n('roles.sort.name');
  const sortAscLabel = useI18n('roles.sort.nameAsc');
  const sortDescLabel = useI18n('roles.sort.nameDesc');
  const scopeFieldLabel = useI18n('roles.filter.scope');
  const systemBucketLabel = useI18n('roles.filter.system');
  const customBucketLabel = useI18n('roles.filter.custom');
  const projectsGroupLabel = useI18n('roles.filter.projects');
  const emptyLabel = useI18n('roles.list.empty');
  const filterPlaceholder = useI18n('roles.filter.placeholder');
  const readOnlyTitle = useI18n('readOnly.title');
  const readOnlyHelp = useI18n('readOnly.help');

  const sortOptions = useMemo(
    () => [
      { id: 'asc', label: sortAscLabel, field: sortNameLabel, direction: 'asc' },
      { id: 'desc', label: sortDescLabel, field: sortNameLabel, direction: 'desc' },
    ],
    [],
  ) satisfies readonly BrowseSortOption<SortDirection>[];

  // Shared with the bucket counts below, so the text runs once per render rather than twice.
  const searched = useMemo(() => searchRoles(items, textOf(query)), [items, query]);

  // Narrow first, order last: sorting only what survived is the cheaper half, and the order the rows
  // appear in has to be the final word.
  const visible = useMemo(
    () => sortByDisplayName(filterRolesByBucket(searched, valuesOf(query, SCOPE_FIELD)), sort),
    [searched, query, sort],
  );

  const fields = useMemo(
    () => [
      scopeField(items, searched, {
        field: scopeFieldLabel,
        system: systemBucketLabel,
        custom: customBucketLabel,
        projects: projectsGroupLabel,
      }),
    ],
    [items, searched, scopeFieldLabel, systemBucketLabel, customBucketLabel, projectsGroupLabel],
  );

  const section = useBrowseSection({
    activeKey,
    openItem,
    closeItem,
    items,
    status,
    selection: rolesSelection,
    filter: rolesFilter,
    visible,
    // A fresh icon element per row: Preact writes into a vnode as it renders it.
    toRow: (role) => toRoleRow(role, <PrincipalIcon principal={role} />),
    reload: () => void loadRolesScreen(),
  });

  return (
    <div data-component={ROLES_PAGE_NAME} className="flex min-h-0 min-w-0 flex-1 flex-col">
      <BrowseScreen
        {...section}
        actions={ROLE_ACTIONS}
        managedMode={isReadOnlyMode()}
        notice={<ManagedModeBanner title={readOnlyTitle} help={readOnlyHelp} />}
        emptyLabel={emptyLabel}
        filterPlaceholder={filterPlaceholder}
        details={<RolesItemPage />}
        fields={fields}
        sort={
          <BrowseSort
            options={sortOptions}
            value={sort}
            onChange={setRolesSort}
            defaultValue={DEFAULT_SORT_DIRECTION}
          />
        }
      />

      <RoleEditorDialog onSaved={() => void loadRolesScreen()} />
      <RoleDeleteDialog activeKey={section.activeKey} onCloseItem={closeItem} />
    </div>
  );
}

RolesPage.displayName = ROLES_PAGE_NAME;
