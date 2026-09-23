/**
 * Rows a details list shows at once: the first cut, each `+N more` step, and the page read from the
 * server when only part of a set is loaded.
 */
export const DETAILS_LIST_PAGE_SIZE = 10;

/** What one `+N more` click adds: a page, or what is left when that is less. */
export function nextPageSize(hidden: number): number {
  return Math.min(hidden, DETAILS_LIST_PAGE_SIZE);
}
