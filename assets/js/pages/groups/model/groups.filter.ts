import type { FilterField, FilterValue } from '@enonic/ui-kit';
import { ShieldLock } from 'lucide-react';

import { idProviderOf, type Group } from '../../../entities/principal';
import { matchesEveryWord } from '../../../shared/filter';

export const ID_PROVIDER_FIELD = 'idProvider';

/**
 * Display name and description, case-insensitive, over the groups already loaded — the same fields
 * the Roles section matches on. The key stays out of the search for the same reason as there: it
 * repeats the display name closely enough that matching it only widens the result set.
 */
export function searchGroups(groups: readonly Group[], query: string): Group[] {
  return groups.filter(({ displayName, description }) =>
    matchesEveryWord(query, [displayName, description]),
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
 * The one field this section filters by: the ID provider, one value per provider the groups come from,
 * labelled the way the rows label it.
 *
 * The providers are read off the keys rather than fetched — a group key carries its provider
 * (`group:<provider>:<name>`) — while the label comes from the page, which has the loaded providers.
 *
 * ! Which values exist comes from every group; only the counts come from `matched`. Taking both from
 * ! the search would drop a value the moment the query stops matching it, while a term holding it goes
 * ! on narrowing the list; a value at zero is offered but cannot be picked.
 */
export function idProviderField(
  groups: readonly Group[],
  matched: readonly Group[],
  providerName: (key: Group['key']) => string | undefined,
  label: string,
): FilterField {
  return {
    id: ID_PROVIDER_FIELD,
    label,
    icon: ShieldLock,
    values: idProviderValues(groups, matched, providerName),
  };
}

function idProviderValues(
  groups: readonly Group[],
  matched: readonly Group[],
  providerName: (key: Group['key']) => string | undefined,
): FilterValue[] {
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
