import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';

import type { SearchStore } from '../../shared/search';
import type { SelectionStore } from '../../shared/selection';
import { useActiveKey } from '../browse-layout/useActiveKey';
import { type BrowseListStatus, type BrowseRow, shownRowKey } from '../browse-list/browse-list';
import type { ActionContext } from '../browse-toolbar/actions';

export type BrowseSectionOptions<T extends { key: string }> = {
  /**
   * Navigation, which stays with the page: the router types a route's params against its own
   * literal path, so a widget cannot navigate to `'/{section}/$id'` for every section. Both go
   * through `replace` — the active row moves with the arrow keys too, and every step would
   * otherwise land in the history.
   */
  openItem: (key: string) => void;
  closeItem: () => void;
  items: readonly T[];
  status: BrowseListStatus;
  /** The section's own stores, from `pages/<section>/model/`. */
  selection: SelectionStore;
  search: SearchStore;
  /**
   * Further per-section narrowing cleared on leaving, alongside the selection and the query — a
   * bucket filter belongs here. Anything the user would expect gone on coming back.
   */
  resetOnLeave?: readonly { clear: () => void }[];
  /**
   * The rows to show, in the order to show them: `items` after the section's own search, bucket
   * filter and sort.
   *
   * The section computes it rather than handing over a callback, because it needs the intermediate
   * result anyway — a filter's counts are taken over the searched items — and a hook that took a
   * `filter(items, query)` would either run the search twice or be passed a function ignoring both
   * of its arguments. Narrowing and ordering are the section's business; turning the result into
   * rows, selection scope and handlers is this hook's.
   */
  visible: readonly T[];
  toRow: (item: T) => BrowseRow;
  /**
   * Rows for work in flight, shown above the list and untouched by the query — they are not items
   * yet, so nothing can search or sort them. `disabled` keeps them out of the selection and the
   * keyboard cursor; see `docs/browse-framework.md` § 3.5.
   */
  leadingRows?: readonly BrowseRow[];
  reload: () => void;
};

export type BrowseSection<T> = {
  rows: readonly BrowseRow[];
  /**
   * The item a row key names.
   *
   * ! What a double click has to resolve against. The two clicks under it move the active row —
   * ! the second one clears it — so by the time the double click lands the action context no longer
   * ! names the row that was hit.
   */
  itemAt: (key: string) => T | undefined;
  status: BrowseListStatus;
  activeKey: string | undefined;
  selectedKeys: ReadonlySet<string>;
  query: string;
  context: ActionContext<T>;
  onQueryChange: (query: string) => void;
  onSelectionChange: (keys: ReadonlySet<string>) => void;
  onActiveChange: (key: string | undefined) => void;
  onRefresh: () => void;
};

/**
 * Everything `BrowseScreen` needs, derived from a section's items and its own stores: rows, the
 * action context, and the handlers behind refresh, selection and the active row. A section keeps
 * only what is genuinely its own — its data, its mappers, its actions.
 */
export function useBrowseSection<T extends { key: string }>({
  openItem,
  closeItem,
  items,
  status,
  selection,
  search,
  resetOnLeave,
  visible,
  toRow,
  leadingRows,
  reload,
}: BrowseSectionOptions<T>): BrowseSection<T> {
  const selectedKeys = useStore(selection.$selected);
  const query = useStore(search.$query);
  const activeKey = useActiveKey();

  useEffect(() => {
    return () => {
      selection.clear();
      search.clear();
      resetOnLeave?.forEach((store) => store.clear());
    };
    // ? The stores outlive the page, so the cleanup only has to run when it unmounts.
  }, []);

  return {
    rows: [...(leadingRows ?? []), ...visible.map(toRow)],
    itemAt: (key) => items.find((item) => item.key === key),
    status,
    activeKey,
    selectedKeys,
    query,
    context: {
      // ! Only the ticks on screen: a query hides rows without unticking them, and an action must
      // ! never reach a row the user cannot see. Content Studio scopes the same way, through its
      // ! loadedSelectionCount. The hidden ticks stay in the store and come back with the query.
      selected: visible.filter(({ key }) => selectedKeys.has(key)),
      active: items.find(({ key }) => key === activeKey),
    },
    onQueryChange: search.set,
    onSelectionChange: (keys) => {
      selection.replace([...keys]);

      // The details column follows the selection: it stays on a row that is ticked, and moves to
      // the row ticked last when it is not. Ticking therefore never leaves it on a row from before.
      const shown = shownRowKey(keys, activeKey);
      if (shown !== undefined && shown !== activeKey) {
        openItem(shown);
      }
    },
    onActiveChange: (key) => {
      if (key === undefined) {
        closeItem();
        return;
      }

      openItem(key);
    },
    onRefresh: () => {
      selection.clear();
      reload();
    },
  };
}
