import type { IdProvider } from '../../../entities/principal';
import type { BrowseFilterEntry } from '../../../widgets/browse-list/browse-filter';

/**
 * Display name, key and description, case-insensitive, over the providers already loaded. The key
 * is searched here, unlike in the principal sections: for a provider it is the name.
 */
export function searchIdProviders(providers: readonly IdProvider[], query: string): IdProvider[] {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return [...providers];
  }

  return providers.filter(({ displayName, key, description }) =>
    [displayName, key, description].some((field) => field?.toLowerCase().includes(needle) ?? false),
  );
}

export const UNBOUND_ENTRY = 'unbound';

/** Which entry a provider falls under: its application, or the one bucket for binding nothing. */
export function applicationEntryOf(provider: IdProvider): string {
  return provider.application?.key ?? UNBOUND_ENTRY;
}

/** No application ticked narrows nothing, the reading every multi-select filter takes. */
export function filterByApplication(
  providers: readonly IdProvider[],
  selected: ReadonlySet<string>,
): IdProvider[] {
  if (selected.size === 0) {
    return [...providers];
  }

  return providers.filter((provider) => selected.has(applicationEntryOf(provider)));
}

/**
 * One entry per bound application, by display name, with the unbound providers last.
 *
 * The application rather than the provider is what earns a filter: several providers can share one,
 * so an entry narrows to something the rows do not already say.
 *
 * ! Which entries exist comes from every provider; only the counts come from `matched`. Taking both
 * ! from the search would drop the entry a user has ticked as soon as the query stops matching it —
 * ! leaving the list narrowed by something absent from the menu, and with an empty result there is
 * ! nothing left to untick it with. `visibleEntries` then hides the ones at zero, but keeps a ticked one.
 */
export function applicationEntries(
  providers: readonly IdProvider[],
  matched: readonly IdProvider[],
  unboundLabel: string,
): BrowseFilterEntry[] {
  const labels = new Map<string, string>();
  const counts = new Map<string, number>();

  for (const provider of providers) {
    const id = applicationEntryOf(provider);
    labels.set(id, provider.application?.displayName ?? unboundLabel);
    counts.set(id, 0);
  }

  for (const provider of matched) {
    const id = applicationEntryOf(provider);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  const bound = [...labels]
    .filter(([id]) => id !== UNBOUND_ENTRY)
    .map(([id, label]) => ({ id, label, count: counts.get(id) ?? 0 }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));

  const unbound = counts.get(UNBOUND_ENTRY);

  return unbound === undefined
    ? bound
    : [...bound, { id: UNBOUND_ENTRY, label: unboundLabel, count: unbound }];
}
