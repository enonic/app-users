import { useStore } from '@nanostores/preact';
import { useMemo } from 'preact/hooks';

import {
  $idProviderUserCounts,
  DEFAULT_PRINCIPAL_SORT,
  forgetUserDetails,
  replaceUser,
  useUsers,
  type PrincipalSort,
} from '../../entities/principal';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import { UserEditorDialog } from '../../features/user-editor/ui/UserEditorDialog';
import { isReadOnlyMode } from '../../shared/config';
import { useHostFrame, useItemId } from '../../shared/host';
import { useI18n } from '../../shared/i18n';
import { BrowseSort, type BrowseSortOption } from '../../widgets/browse-list/BrowseSort';
import { BrowseScreen } from '../../widgets/browse-screen/BrowseScreen';
import { useBrowseSection } from '../../widgets/browse-screen/useBrowseSection';
import { ManagedModeBanner } from '../../widgets/browse-toolbar/ManagedModeBanner';
import { usersFilter } from './model/filter.store';
import { $usersQuery, clearUsersQuery, setUsersSort } from './model/query.store';
import { usersSelection } from './model/selection.store';
import { USER_ACTIONS } from './model/users.actions';
import { providerField } from './model/users.filter';
import { toUserRow } from './model/users.rows';
import { loadMoreUsers, reloadUsersScreen } from './model/users.screen';
import { useUsersScreen } from './model/useUsersScreen';
import { UserDeleteDialog } from './UserDeleteDialog';
import { UsersItemPage } from './UsersItemPage';

const USERS_PAGE_NAME = 'UsersPage';

export function UsersPage() {
  // One request for a page of users and the providers that name them.
  useUsersScreen();
  const { openItem, closeItem } = useHostFrame();
  const activeKey = useItemId();
  const { status, items, appending, error, hasMore } = useUsers();
  const { items: providerCounts } = useStore($idProviderUserCounts);

  const { sort } = useStore($usersQuery);

  const sortNameLabel = useI18n('users.sort.name');
  const sortNameAscLabel = useI18n('users.sort.nameAsc');
  const sortNameDescLabel = useI18n('users.sort.nameDesc');
  const sortProviderLabel = useI18n('users.sort.idProvider');
  const sortProviderAscLabel = useI18n('users.sort.idProviderAsc');
  const sortProviderDescLabel = useI18n('users.sort.idProviderDesc');
  const emptyLabel = useI18n('users.list.empty');
  const filterPlaceholder = useI18n('users.filter.placeholder');
  const readOnlyTitle = useI18n('readOnly.title');
  const readOnlyHelp = useI18n('readOnly.help');
  const loadMoreFailedNotice = useI18n('browse.list.loadMoreFailed');
  const providerFieldLabel = useI18n('users.filter.idProvider');

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

  // ! The values come from the provider list, never from the rows: the rows are one page, so a provider
  // ! the page happens not to contain would disappear from the filter while still narrowing the query.
  const fields = useMemo(
    () => [providerField(providerCounts, providerFieldLabel)],
    [providerCounts, providerFieldLabel],
  );

  const section = useBrowseSection({
    activeKey,
    openItem,
    closeItem,
    items,
    status,
    selection: usersSelection,
    filter: usersFilter,
    resetOnLeave: [{ clear: clearUsersQuery }],
    // The server narrowed and ordered this page; the client adds nothing.
    visible: items,
    // A fresh icon element per row: Preact writes into a vnode as it renders it.
    toRow: (user) => toUserRow(user, <PrincipalIcon principal={user} />),
    reload: () => void reloadUsersScreen(),
  });

  return (
    <div data-component={USERS_PAGE_NAME} className="flex min-h-0 min-w-0 flex-1 flex-col">
      <BrowseScreen
        {...section}
        actions={USER_ACTIONS}
        managedMode={isReadOnlyMode()}
        notice={<ManagedModeBanner title={readOnlyTitle} help={readOnlyHelp} />}
        emptyLabel={emptyLabel}
        filterPlaceholder={filterPlaceholder}
        details={<UsersItemPage />}
        hasMore={hasMore}
        onLoadMore={() => void loadMoreUsers()}
        loadingMore={appending}
        // A page that did not arrive leaves the rows valid, so it is reported beside the control rather
        // than as a list error. Only a first page can put the list itself into an error state.
        loadMoreError={status === 'ready' && error !== undefined ? loadMoreFailedNotice : undefined}
        fields={fields}
        sort={
          <BrowseSort
            options={sortOptions}
            value={sort}
            onChange={setUsersSort}
            defaultValue={DEFAULT_PRINCIPAL_SORT}
          />
        }
      />

      <UserEditorDialog
        section="users"
        onSaved={(written, mode) => {
          if (mode === 'create') {
            void reloadUsersScreen();
            return;
          }

          replaceUser(written);
          forgetUserDetails();
        }}
      />
      <UserDeleteDialog activeKey={section.activeKey} onCloseItem={closeItem} />
    </div>
  );
}

UsersPage.displayName = USERS_PAGE_NAME;
