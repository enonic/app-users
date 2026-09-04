import { useStore } from '@nanostores/preact';
import { useMemo } from 'preact/hooks';

import {
  forgetServiceAccountDetails,
  replaceServiceAccount,
  useServiceAccounts,
} from '../../entities/principal';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import { UserEditorDialog } from '../../features/user-editor/UserEditorDialog';
import { useHostFrame, useItemId } from '../../shared/host';
import { useI18n } from '../../shared/i18n';
import { type SortDirection } from '../../widgets/browse-list/browse-sort';
import { BrowseSort } from '../../widgets/browse-list/BrowseSort';
import { BrowseScreen } from '../../widgets/browse-screen/BrowseScreen';
import { useBrowseSection } from '../../widgets/browse-screen/useBrowseSection';
import {
  $serviceAccountsQuery,
  clearServiceAccountsQuery,
  setServiceAccountsSort,
  sortDirectionOf,
} from './model/query.store';
import { serviceAccountsSearch } from './model/search.store';
import { serviceAccountsSelection } from './model/selection.store';
import { SERVICE_ACCOUNT_ACTIONS } from './model/service-accounts.actions';
import { toServiceAccountRow } from './model/service-accounts.rows';
import {
  loadMoreServiceAccounts,
  reloadServiceAccountsScreen,
} from './model/service-accounts.screen';
import { useServiceAccountsScreen } from './model/useServiceAccountsScreen';
import { ServiceAccountDeleteDialog } from './ServiceAccountDeleteDialog';
import { ServiceAccountsItemPage } from './ServiceAccountsItemPage';

export function ServiceAccountsPage() {
  // One request for a page of the system store's users.
  useServiceAccountsScreen();
  const { openItem, closeItem } = useHostFrame();
  const activeKey = useItemId();
  const { status, items, appending, error, hasMore } = useServiceAccounts();
  const query = useStore($serviceAccountsQuery);

  const sortAscLabel = useI18n('users.sort.nameAsc');
  const sortDescLabel = useI18n('users.sort.nameDesc');
  const emptyLabel = useI18n('serviceAccounts.list.empty');
  const loadMoreFailedNotice = useI18n('browse.list.loadMoreFailed');

  const sortOptions = useMemo(
    () => [
      { id: 'asc', label: sortAscLabel },
      { id: 'desc', label: sortDescLabel },
    ],
    [],
  ) satisfies readonly { id: SortDirection; label: string }[];

  const section = useBrowseSection({
    activeKey,
    openItem,
    closeItem,
    items,
    status,
    selection: serviceAccountsSelection,
    search: serviceAccountsSearch,
    resetOnLeave: [{ clear: clearServiceAccountsQuery }],
    // The server narrowed and ordered this page; the client adds nothing.
    visible: items,
    // A fresh icon element per row: Preact writes into a vnode as it renders it.
    toRow: (user) => toServiceAccountRow(user, <PrincipalIcon principal={user} />),
    reload: () => void reloadServiceAccountsScreen(),
  });

  return (
    <>
      <BrowseScreen
        {...section}
        actions={SERVICE_ACCOUNT_ACTIONS}
        emptyLabel={emptyLabel}
        details={<ServiceAccountsItemPage />}
        hasMore={hasMore}
        onLoadMore={() => void loadMoreServiceAccounts()}
        loadingMore={appending}
        // A page that did not arrive leaves the rows valid, so it is reported beside the control rather
        // than as a list error. Only a first page can put the list itself into an error state.
        loadMoreError={status === 'ready' && error !== undefined ? loadMoreFailedNotice : undefined}
        sort={
          <BrowseSort
            options={sortOptions}
            value={sortDirectionOf(query)}
            onChange={setServiceAccountsSort}
          />
        }
      />

      <UserEditorDialog
        serviceAccount
        onSaved={(written, mode) => {
          if (mode === 'create') {
            void reloadServiceAccountsScreen();
            return;
          }

          replaceServiceAccount(written);
          forgetServiceAccountDetails();
        }}
      />
      <ServiceAccountDeleteDialog activeKey={section.activeKey} onCloseItem={closeItem} />
    </>
  );
}
