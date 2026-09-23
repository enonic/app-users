/**
 * Rows a details list shows at once: the first cut, each `+N more` step, and the page read from the
 * server when only part of a set is loaded.
 */
export const DETAILS_LIST_PAGE_SIZE = 10;

export type LoadMoreSlice<T> = {
  visible: readonly T[];
  /** Rows not on screen, counted off `total` when `items` is only the page of it that was loaded. */
  hiddenCount: number;
  /** What one click adds: a page, or what is left when that is less. `0` when a click brings nothing. */
  nextCount: number;
};

export type LoadMoreSliceOptions = {
  /** Rows shown; `undefined` shows them all. Ignored when `paged`. */
  limit?: number;
  total?: number;
  /** The caller reads the next page: every row in `items` is visible, and a click brings the rest. */
  paged?: boolean;
};

export function sliceLoadMore<T>(
  items: readonly T[],
  { limit, total, paged = false }: LoadMoreSliceOptions,
): LoadMoreSlice<T> {
  const visible = paged || limit === undefined ? items : items.slice(0, limit);
  const hiddenCount = Math.max(total ?? items.length, items.length) - visible.length;
  const rest = paged ? hiddenCount : items.length - visible.length;

  return { visible, hiddenCount, nextCount: Math.min(rest, DETAILS_LIST_PAGE_SIZE) };
}
