import { useStore } from '@nanostores/preact';
import { ShieldLock } from 'lucide-react';
import { useMemo } from 'preact/hooks';

import {
  loadIdProviders,
  receiveIdProvider,
  reloadIdProviderPermissions,
  reloadIdProviderPrincipalRows,
  useIdProviders,
} from '../../entities/principal';
import { IdProviderEditorDialog } from '../../features/idprovider-editor/ui/IdProviderEditorDialog';
import { isReadOnlyMode } from '../../shared/config';
import { textOf, valuesOf } from '../../shared/filter';
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
import { IdProviderDeleteDialog } from './IdProviderDeleteDialog';
import { IdProvidersItemPage } from './IdProvidersItemPage';
import { idProvidersFilter } from './model/filter.store';
import { ID_PROVIDER_ACTIONS } from './model/id-providers.actions';
import {
  APPLICATION_FIELD,
  applicationField,
  filterByApplication,
  searchIdProviders,
} from './model/id-providers.filter';
import { toIdProviderRow } from './model/id-providers.rows';
import { idProvidersSelection } from './model/selection.store';
import { $idProvidersSort, setIdProvidersSort } from './model/sort.store';
import { useIdProvidersScreen } from './model/useIdProvidersScreen';

const ID_PROVIDERS_PAGE_NAME = 'IdProvidersPage';

export function IdProvidersPage() {
  useIdProvidersScreen();
  const { openItem, closeItem } = useHostFrame();
  const activeKey = useItemId();
  const { status, items } = useIdProviders();
  const query = useStore(idProvidersFilter.$query);
  const sort = useStore($idProvidersSort);

  const sortNameLabel = useI18n('idProviders.sort.name');
  const sortAscLabel = useI18n('idProviders.sort.nameAsc');
  const sortDescLabel = useI18n('idProviders.sort.nameDesc');
  const applicationFieldLabel = useI18n('idProviders.filter.application');
  const unboundLabel = useI18n('idProviders.filter.unbound');
  const emptyLabel = useI18n('idProviders.list.empty');
  const filterPlaceholder = useI18n('idProviders.filter.placeholder');
  const readOnlyTitle = useI18n('readOnly.title');
  const readOnlyHelp = useI18n('readOnly.help');

  const sortOptions = useMemo(
    () => [
      { id: 'asc', label: sortAscLabel, field: sortNameLabel, direction: 'asc' },
      { id: 'desc', label: sortDescLabel, field: sortNameLabel, direction: 'desc' },
    ],
    [],
  ) satisfies readonly BrowseSortOption<SortDirection>[];

  // Shared with the field's counts below, so the text runs once per render rather than twice.
  const searched = useMemo(() => searchIdProviders(items, textOf(query)), [items, query]);

  // Narrow first, order last.
  const visible = useMemo(
    () =>
      sortByDisplayName(filterByApplication(searched, valuesOf(query, APPLICATION_FIELD)), sort),
    [searched, query, sort],
  );

  // Counts follow the text but not the picked applications, so the filter shrinks with the search
  // rather than restating the current narrowing.
  const fields = useMemo(
    () => [
      applicationField(items, searched, { field: applicationFieldLabel, unbound: unboundLabel }),
    ],
    [items, searched, applicationFieldLabel, unboundLabel],
  );

  const section = useBrowseSection({
    activeKey,
    openItem,
    closeItem,
    items,
    status,
    selection: idProvidersSelection,
    filter: idProvidersFilter,
    visible,
    // A fresh icon element per row: Preact writes into a vnode as it renders it.
    toRow: (provider) =>
      toIdProviderRow(provider, <ShieldLock size={24} strokeWidth={1.5} aria-hidden />),
    reload: () => {
      // The panel's permissions, users and groups are requests of their own, so `Refresh` has to reach them too.
      reloadIdProviderPermissions();
      reloadIdProviderPrincipalRows();
      void loadIdProviders();
    },
  });

  return (
    <div data-component={ID_PROVIDERS_PAGE_NAME} className="flex min-h-0 min-w-0 flex-1 flex-col">
      <BrowseScreen
        {...section}
        actions={ID_PROVIDER_ACTIONS}
        managedMode={isReadOnlyMode()}
        notice={<ManagedModeBanner title={readOnlyTitle} help={readOnlyHelp} />}
        emptyLabel={emptyLabel}
        filterPlaceholder={filterPlaceholder}
        details={<IdProvidersItemPage />}
        fields={fields}
        sort={
          <BrowseSort
            options={sortOptions}
            value={sort}
            onChange={setIdProvidersSort}
            defaultValue={DEFAULT_SORT_DIRECTION}
          />
        }
      />

      <IdProviderEditorDialog
        onSaved={(written) => {
          receiveIdProvider(written);
        }}
      />
      <IdProviderDeleteDialog activeKey={section.activeKey} onCloseItem={closeItem} />
    </div>
  );
}

IdProvidersPage.displayName = ID_PROVIDERS_PAGE_NAME;
