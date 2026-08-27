import { useStore } from '@nanostores/preact';
import { ShieldLock } from 'lucide-react';
import { useMemo } from 'preact/hooks';

import {
  loadIdProviders,
  receiveIdProvider,
  reloadIdProviderPrincipalRows,
  useIdProviders,
} from '../../entities/principal';
import { IdProviderEditorDialog } from '../../features/idprovider-editor/IdProviderEditorDialog';
import { closeItem, openItem } from '../../shared/host';
import { useI18n } from '../../shared/i18n';
import { visibleEntries } from '../../widgets/browse-list/browse-filter';
import { sortByDisplayName, type SortDirection } from '../../widgets/browse-list/browse-sort';
import { BrowseFilter } from '../../widgets/browse-list/BrowseFilter';
import { BrowseSort } from '../../widgets/browse-list/BrowseSort';
import { BrowseScreen } from '../../widgets/browse-screen/BrowseScreen';
import { useBrowseSection } from '../../widgets/browse-screen/useBrowseSection';
import { IdProviderDeleteDialog } from './IdProviderDeleteDialog';
import { IdProvidersItemPage } from './IdProvidersItemPage';
import { idProvidersFilter } from './model/filter.store';
import { ID_PROVIDER_ACTIONS } from './model/id-providers.actions';
import {
  applicationEntries,
  filterByApplication,
  searchIdProviders,
} from './model/id-providers.filter';
import { toIdProviderRow } from './model/id-providers.rows';
import { idProvidersSearch } from './model/search.store';
import { idProvidersSelection } from './model/selection.store';
import { $idProvidersSort, setIdProvidersSort } from './model/sort.store';
import { useIdProvidersScreen } from './model/useIdProvidersScreen';

export function IdProvidersPage() {
  useIdProvidersScreen();
  const { status, items } = useIdProviders();
  const query = useStore(idProvidersSearch.$query);
  const selectedApplications = useStore(idProvidersFilter.$selected);
  const sort = useStore($idProvidersSort);

  const sortAscLabel = useI18n('idProviders.sort.nameAsc');
  const sortDescLabel = useI18n('idProviders.sort.nameDesc');
  const unboundLabel = useI18n('idProviders.filter.unbound');
  const emptyLabel = useI18n('idProviders.list.empty');

  const sortOptions = useMemo(
    () => [
      { id: 'asc', label: sortAscLabel },
      { id: 'desc', label: sortDescLabel },
    ],
    [],
  ) satisfies readonly { id: SortDirection; label: string }[];

  // Shared with the filter entries below, so the query runs once per render rather than twice.
  const searched = useMemo(() => searchIdProviders(items, query), [items, query]);

  // Narrow first, order last.
  const visible = useMemo(
    () => sortByDisplayName(filterByApplication(searched, selectedApplications), sort),
    [searched, selectedApplications, sort],
  );

  // Entries follow the query but not the ticked applications, so the filter shrinks with the
  // search rather than restating the current narrowing.
  const entries = useMemo(
    () => visibleEntries(applicationEntries(items, searched, unboundLabel), selectedApplications),
    [items, searched, selectedApplications],
  );

  const section = useBrowseSection({
    openItem,
    closeItem,
    items,
    status,
    selection: idProvidersSelection,
    search: idProvidersSearch,
    resetOnLeave: [idProvidersFilter],
    visible,
    // A fresh icon element per row: Preact writes into a vnode as it renders it.
    toRow: (provider) =>
      toIdProviderRow(provider, <ShieldLock size={24} strokeWidth={1.5} aria-hidden />),
    reload: () => {
      // The panel's users and groups are a request of their own, so `Refresh` has to reach them too.
      reloadIdProviderPrincipalRows();
      void loadIdProviders();
    },
  });

  return (
    <>
      <BrowseScreen
        {...section}
        actions={ID_PROVIDER_ACTIONS}
        emptyLabel={emptyLabel}
        details={<IdProvidersItemPage />}
        filter={
          <BrowseFilter
            entries={entries}
            selected={selectedApplications}
            onToggle={(id) => idProvidersFilter.toggle(id)}
          />
        }
        sort={<BrowseSort options={sortOptions} value={sort} onChange={setIdProvidersSort} />}
      />

      <IdProviderEditorDialog onSaved={receiveIdProvider} />
      <IdProviderDeleteDialog activeKey={section.activeKey} onCloseItem={closeItem} />
    </>
  );
}
