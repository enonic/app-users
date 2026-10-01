import type { ReactNode } from 'react';

import type { FilterQuery } from '../../shared/filter';
import { useI18n, useLabelled } from '../../shared/i18n';
import type { FilterField } from '../browse-filter/browse-filter';
import { FilterInput } from '../browse-filter/FilterInput';
import { BrowseLayout } from '../browse-layout/BrowseLayout';
import {
  type BrowseListStatus,
  type BrowseRow,
  selectableKeys,
  selectAllState,
} from '../browse-list/browse-list';
import { BrowseList } from '../browse-list/BrowseList';
import { BrowseListContextMenu } from '../browse-list/BrowseListContextMenu';
import { BrowseListHeader } from '../browse-list/BrowseListHeader';
import { type ActionContext, type SectionAction } from '../browse-toolbar/actions';
import { BrowseToolbar } from '../browse-toolbar/BrowseToolbar';

export type BrowseScreenProps<T> = {
  actions: readonly SectionAction<T>[];
  context: ActionContext<T>;
  rows: readonly BrowseRow[];
  status: BrowseListStatus;
  activeKey?: string;
  selectedKeys: ReadonlySet<string>;
  query: FilterQuery;
  /** The fields the filter offers. None leaves it a free-text search. */
  fields?: readonly FilterField[];
  /** The filter's empty-input prompt, named for the section: `Search users`. */
  filterPlaceholder?: string;
  /** Shown when the section itself is empty; a query with no match says so on its own. */
  emptyLabel: string;
  /** The details column, rendered once `activeKey` names a row. */
  details: ReactNode;
  /** Managed mode: no action is offered anywhere — toolbar, row menu or double click. */
  managedMode?: boolean;
  /** What stands in the action row's place, normally `ManagedModeBanner` with the section's copy. */
  notice?: ReactNode;
  onQueryChange: (query: FilterQuery) => void;
  onSelectionChange: (keys: ReadonlySet<string>) => void;
  onActiveChange: (key: string | undefined) => void;
  onRefresh: () => void;
  sort?: ReactNode;
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  loadMoreError?: string;
  /** Lands on the layout root: the screen has no element of its own. */
  'data-component'?: string;
};

const BROWSE_SCREEN_NAME = 'BrowseScreen';

const NO_FIELDS: readonly FilterField[] = [];

/**
 * The whole browse screen, so a section states its data and actions and nothing else. Every section
 * renders the same toolbar, filter, header, list and details column, and the wiring lives here rather
 * than being copied per section.
 */
export function BrowseScreen<T>({
  actions,
  context,
  rows,
  status,
  activeKey,
  selectedKeys,
  query,
  fields = NO_FIELDS,
  filterPlaceholder,
  emptyLabel,
  details,
  managedMode,
  notice,
  onQueryChange,
  onSelectionChange,
  onActiveChange,
  onRefresh,
  sort,
  hasMore,
  onLoadMore,
  loadingMore,
  loadMoreError,
  'data-component': componentName = BROWSE_SCREEN_NAME,
}: BrowseScreenProps<T>) {
  const noMatchesLabel = useI18n('browse.list.noMatches');
  const labelledActions = useLabelled(actions);

  const handleSelectAllChange = (checked: boolean): void => {
    onSelectionChange(checked ? new Set(selectableKeys(rows)) : new Set());
  };

  return (
    <BrowseLayout
      data-component={componentName}
      toolbar={managedMode ? notice : <BrowseToolbar actions={labelledActions} context={context} />}
      // The active row is what the shell's url resolved to, so it is also what says whether the
      // details column has anything to show.
      detailsShown={activeKey !== undefined}
      list={
        <>
          <FilterInput
            fields={fields}
            value={query}
            onChange={onQueryChange}
            placeholder={filterPlaceholder}
          />

          <BrowseListHeader
            allSelected={managedMode ? undefined : selectAllState(rows, selectedKeys)}
            onSelectAllChange={managedMode ? undefined : handleSelectAllChange}
            onRefresh={onRefresh}
            sort={sort}
          />

          {/* The row menu is the toolbar's list, so managed mode empties it and it renders nothing. */}
          <BrowseListContextMenu actions={managedMode ? [] : labelledActions} context={context}>
            <BrowseList
              rows={rows}
              activeKey={activeKey}
              selectedKeys={selectedKeys}
              onSelectionChange={onSelectionChange}
              onActiveChange={onActiveChange}
              selectable={managedMode !== true}
              status={status}
              emptyLabel={query.length > 0 ? noMatchesLabel : emptyLabel}
              hasMore={hasMore}
              onLoadMore={onLoadMore}
              loadingMore={loadingMore}
              loadMoreError={loadMoreError}
            />
          </BrowseListContextMenu>
        </>
      }
      details={details}
    />
  );
}

BrowseScreen.displayName = BROWSE_SCREEN_NAME;
