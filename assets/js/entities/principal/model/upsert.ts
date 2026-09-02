export function upsert<T extends { key: string }>(items: readonly T[], item: T): T[] {
  return items.some(({ key }) => key === item.key)
    ? items.map((loaded) => (loaded.key === item.key ? item : loaded))
    : [...items, item];
}
