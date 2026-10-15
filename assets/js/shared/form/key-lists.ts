type Keyed = { key: string };

/**
 * The loaded list plus whatever the form gained while it was in flight.
 *
 * ! Assigning a late answer over the form instead would drop whatever was ticked while it was outstanding.
 */
export function mergeByKey<T extends Keyed>(loaded: readonly T[], edited: readonly T[]): T[] {
  const known = new Set(loaded.map(({ key }) => key));

  return [...loaded, ...edited.filter(({ key }) => !known.has(key))];
}

/** What moved between the list as it was saved and the list as it is now, as keys. */
export type KeyDiff<K extends string = string> = {
  added: K[];
  removed: K[];
};

/**
 * The change a form makes to a list, rather than the list it ends up with.
 *
 * ! `saved` has to be what the server last answered, never what is on screen — a diff against a stale side
 * ! names changes the user never made.
 */
export function diffByKey<T extends Keyed>(
  saved: readonly T[],
  edited: readonly T[],
): KeyDiff<T['key']> {
  const before = new Set(saved.map(({ key }) => key));
  const after = new Set(edited.map(({ key }) => key));

  return {
    added: [...after].filter((key) => !before.has(key)),
    removed: [...before].filter((key) => !after.has(key)),
  };
}

/** Whether two lists name the same things, in whatever order they happen to hold them. */
export function sameKeys(one: readonly Keyed[], other: readonly Keyed[]): boolean {
  if (one.length !== other.length) {
    return false;
  }

  const keys = new Set(one.map(({ key }) => key));

  return other.every(({ key }) => keys.has(key));
}
