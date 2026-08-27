/**
 * The client-side half of the picker's search: the kinds loaded whole are narrowed here, while users go
 * through `findUsers` on the server. Key as well as display name, because a group reads as `Store
 * Managers` while the thing an administrator remembers is `group:store:managers`.
 */
export function matching<T extends { key: string; displayName: string }>(
  hits: readonly T[],
  search: string,
): T[] {
  const needle = search.trim().toLowerCase();
  if (needle.length === 0) {
    return [...hits];
  }

  return hits.filter(
    ({ key, displayName }) =>
      displayName.toLowerCase().includes(needle) || key.toLowerCase().includes(needle),
  );
}
