import { idProviderOf, type Group } from '../../../entities/principal';
import type { BrowseFilterEntry } from '../../../widgets/browse-list/browse-filter';

/**
 * Display name and description, case-insensitive, over the groups already loaded — the same fields
 * the Roles section matches on. The key stays out of the search for the same reason as there: it
 * repeats the display name closely enough that matching it only widens the result set.
 */
export function searchGroups(groups: readonly Group[], query: string): Group[] {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return [...groups];
  }

  return groups.filter(
    ({ displayName, description }) =>
      displayName.toLowerCase().includes(needle) ||
      (description?.toLowerCase().includes(needle) ?? false),
  );
}

/** No provider ticked narrows nothing, the reading every multi-select filter takes. */
export function filterByIdProvider(
  groups: readonly Group[],
  selected: ReadonlySet<string>,
): Group[] {
  if (selected.size === 0) {
    return [...groups];
  }

  return groups.filter(({ key }) => {
    const provider = idProviderOf(key);
    return provider !== undefined && selected.has(provider);
  });
}

/**
 * One entry per ID provider the groups come from, labelled the way the rows label it.
 *
 * The providers are read off the keys rather than fetched — a group key carries its provider
 * (`group:<provider>:<name>`) — while the label comes from the page, which has the loaded providers.
 *
 * ! Which entries exist comes from every group; only the counts come from `matched`. Taking both from
 * ! the search would drop the entry a user has ticked as soon as the query stops matching it — leaving
 * ! the list narrowed by something absent from the menu, and with an empty result there is nothing left
 * ! to untick it with. `visibleEntries` then hides the ones at zero, but keeps a ticked one.
 */
export function idProviderEntries(
  groups: readonly Group[],
  matched: readonly Group[],
  providerName: (key: Group['key']) => string | undefined,
): BrowseFilterEntry[] {
  const labels = new Map<string, string>();
  const counts = new Map<string, number>();

  for (const { key } of groups) {
    const provider = idProviderOf(key);
    if (provider !== undefined) {
      labels.set(provider, providerName(key) ?? provider);
      counts.set(provider, 0);
    }
  }

  for (const { key } of matched) {
    const provider = idProviderOf(key);
    if (provider !== undefined) {
      counts.set(provider, (counts.get(provider) ?? 0) + 1);
    }
  }

  return [...labels]
    .map(([provider, label]) => ({ id: provider, label, count: counts.get(provider) ?? 0 }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
}
