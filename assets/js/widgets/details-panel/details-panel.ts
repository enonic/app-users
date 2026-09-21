import type { DetailStatus } from '../../shared/detail';

/**
 * What a panel with no item to show says: a failure names why, with the section's own phrase since only
 * it can say what failed; anything else is the empty column the layout shows with no item route at all.
 */
export function detailsEmptyLabelKey(status: DetailStatus, failedLabelKey: string): string {
  return status === 'error' ? failedLabelKey : 'browse.details.empty';
}

/**
 * Rows a details list shows before the rest collapse into a `+N more` line.
 *
 * The same number as `PrincipalAvatars`: a membership list is unbounded, and the two ways of showing
 * principals have to cut at the same place.
 */
export const DETAILS_LIST_LIMIT = 10;

export type ListSlice<T> = {
  shown: readonly T[];
  hidden: number;
};

/** The first `limit` rows and the count of the rest, off `total` when `items` is only a loaded page. */
export function sliceList<T>(items: readonly T[], limit?: number, total?: number): ListSlice<T> {
  const shown = limit === undefined ? items : items.slice(0, limit);

  return { shown, hidden: Math.max(total ?? items.length, items.length) - shown.length };
}

/** A section or subsection label with its entry count: `Members (8)`. */
export function withCount(label: string, count: number | undefined): string {
  return count === undefined ? label : `${label} (${count})`;
}

/**
 * The sections worth rendering: one with nothing in it is a label and a rule over empty space, so a
 * panel drops it rather than showing `Members (0)`. Generic over the whole section, so a caller can
 * carry an icon or anything else alongside its items.
 */
export function filledSections<S extends { items: readonly unknown[] }>(
  sections: readonly S[],
): S[] {
  return sections.filter(({ items }) => items.length > 0);
}

/**
 * The same, for a section whose size is known before its contents are.
 *
 * A set the caller has only counted still earns its heading — `Users (4213)` says something even
 * with no rows under it — so emptiness is decided by `total`, never by how many rows arrived.
 */
export function countedSections<S extends { set: { total: number } }>(sections: readonly S[]): S[] {
  return sections.filter(({ set }) => set.total > 0);
}
