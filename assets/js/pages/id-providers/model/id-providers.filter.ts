import { Package } from 'lucide-react';

import type { IdProvider } from '../../../entities/principal';
import { matchesEveryWord } from '../../../shared/filter';
import type { FilterField, FilterValue } from '../../../widgets/browse-filter/browse-filter';

export const APPLICATION_FIELD = 'application';

/**
 * Display name, key and description, case-insensitive, over the providers already loaded. The key
 * is searched here, unlike in the principal sections: for a provider it is the name.
 */
export function searchIdProviders(providers: readonly IdProvider[], query: string): IdProvider[] {
  return providers.filter(({ displayName, key, description }) =>
    matchesEveryWord(query, [displayName, key, description]),
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
 * The one field this section filters by: the application a provider is bound to.
 *
 * The application rather than the provider is what earns a filter: several providers can share one,
 * so a value narrows to something the rows do not already say.
 */
export function applicationField(
  providers: readonly IdProvider[],
  matched: readonly IdProvider[],
  labels: { field: string; unbound: string },
): FilterField {
  return {
    id: APPLICATION_FIELD,
    label: labels.field,
    icon: Package,
    values: applicationValues(providers, matched, labels.unbound),
  };
}

/**
 * One value per bound application, by display name, with the unbound providers last.
 *
 * ! Which values exist comes from every provider; only the counts come from `matched`. Taking both
 * ! from the search would drop a value the moment the query stops matching it, while a term holding it
 * ! goes on narrowing the list; a value at zero is offered but cannot be picked.
 */
export function applicationValues(
  providers: readonly IdProvider[],
  matched: readonly IdProvider[],
  unboundLabel: string,
): FilterValue[] {
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
