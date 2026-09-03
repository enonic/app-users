import { useStore } from '@nanostores/preact';
import { useMemo } from 'preact/hooks';

import {
  $idProviderUserCounts,
  forgetUserDetails,
  replaceUser,
  useIdProviderName,
  useUsers,
} from '../../entities/principal';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import { UserEditorDialog } from '../../features/user-editor/UserEditorDialog';
import { useHostFrame, useItemId } from '../../shared/host';
import { useI18n } from '../../shared/i18n';
import { visibleEntries } from '../../widgets/browse-list/browse-filter';
import { type SortDirection } from '../../widgets/browse-list/browse-sort';
import { BrowseFilter } from '../../widgets/browse-list/BrowseFilter';
import { BrowseSort } from '../../widgets/browse-list/BrowseSort';
import { BrowseScreen } from '../../widgets/browse-screen/BrowseScreen';
import { useBrowseSection } from '../../widgets/browse-screen/useBrowseSection';
import {
  $usersQuery,
  clearUsersQuery,
  toggleUsersIdProvider,
  setUsersSort,
  sortDirectionOf,
} from './model/query.store';
import { usersSearch } from './model/search.store';
import { usersSelection } from './model/selection.store';
import { USER_ACTIONS } from './model/users.actions';
import { providerEntries } from './model/users.filter';
import { toUserRow } from './model/users.rows';
import { loadMoreUsers, reloadUsersScreen } from './model/users.screen';
import { useUsersScreen } from './model/useUsersScreen';
import { UserDeleteDialog } from './UserDeleteDialog';
import { UsersItemPage } from './UsersItemPage';

export function UsersPage() {
  // One request for a page of users and the providers that name them.
  useUsersScreen();
  const { openItem, closeItem } = useHostFrame();
  const activeKey = useItemId();
  const { status, items, appending, error, hasMore } = useUsers();
  const { items: providerCounts, status: providersStatus } = useStore($idProviderUserCounts);
  const providerName = useIdProviderName();
  const { idProviders, sort } = useStore($usersQuery);

  const sortAscLabel = useI18n('users.sort.nameAsc');
  const sortDescLabel = useI18n('users.sort.nameDesc');
  const emptyLabel = useI18n('users.list.empty');
  const loadMoreFailedNotice = useI18n('browse.list.loadMoreFailed');
  const providersFailedNotice = useI18n('users.filter.providersFailed');

  const sortOptions = useMemo(
    () => [
      { id: 'asc', label: sortAscLabel },
      { id: 'desc', label: sortDescLabel },
    ],
    [],
  ) satisfies readonly { id: SortDirection; label: string }[];

  // ! Entries come from the provider list, never from the rows: the rows are one page, so a provider the
  // ! page happens not to contain would disappear from the menu while still narrowing the query. They
  // ! carry no count either — `findUsers` reports one total for the whole query and nothing per provider.
  const entries = useMemo(
    () => visibleEntries(providerEntries(providerCounts), new Set(idProviders)),
    [providerCounts, idProviders],
  );

  const section = useBrowseSection({
    activeKey,
    openItem,
    closeItem,
    items,
    status,
    selection: usersSelection,
    search: usersSearch,
    resetOnLeave: [{ clear: clearUsersQuery }],
    // The server narrowed and ordered this page; the client adds nothing.
    visible: items,
    // A fresh icon element per row: Preact writes into a vnode as it renders it.
    toRow: (user) => toUserRow(user, <PrincipalIcon principal={user} />, providerName),
    reload: () => void reloadUsersScreen(),
  });

  return (
    <>
      <BrowseScreen
        {...section}
        actions={USER_ACTIONS}
        emptyLabel={emptyLabel}
        details={<UsersItemPage />}
        hasMore={hasMore}
        onLoadMore={() => void loadMoreUsers()}
        loadingMore={appending}
        // A page that did not arrive leaves the rows valid, so it is reported beside the control rather
        // than as a list error. Only a first page can put the list itself into an error state.
        loadMoreError={status === 'ready' && error !== undefined ? loadMoreFailedNotice : undefined}
        filter={
          <BrowseFilter
            entries={entries}
            selected={new Set(idProviders)}
            onToggle={toggleUsersIdProvider}
            // A provider list that failed to load leaves the menu short while the ticked provider goes on
            // narrowing the query; saying so beats a menu that looks complete.
            notice={providersStatus === 'error' ? providersFailedNotice : undefined}
          />
        }
        sort={
          <BrowseSort
            options={sortOptions}
            value={sortDirectionOf({ idProviders, sort })}
            onChange={setUsersSort}
          />
        }
      />

      <UserEditorDialog
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
    </>
  );
}
