import type { IdProviderName } from './principal.types';

/** Display name and key, case-insensitive: for a provider the key is its name. */
export function searchIdProviderNames<T extends IdProviderName>(
  providers: readonly T[],
  query: string,
): T[] {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return [...providers];
  }

  return providers.filter(({ displayName, key }) =>
    [displayName, key].some((field) => field.toLowerCase().includes(needle)),
  );
}
