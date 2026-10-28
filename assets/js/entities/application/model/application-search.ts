import type { IdProviderApplication } from './application.types';

/** Display name and key, case-insensitive. */
export function searchApplications<T extends Pick<IdProviderApplication, 'key' | 'displayName'>>(
  applications: readonly T[],
  query: string,
): T[] {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return [...applications];
  }

  return applications.filter(({ displayName, key }) =>
    [displayName, key].some((field) => field.toLowerCase().includes(needle)),
  );
}
