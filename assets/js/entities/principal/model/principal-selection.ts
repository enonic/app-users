/**
 * The keys a selector with room for `maximum` holds once the picker hands back `picked`: the picker keeps
 * what was there and appends what was ticked, so the last `maximum` are kept and a new pick displaces the
 * oldest — which, with room for one, is a replacement. `maximum` 0 is unbounded. Duplicates are dropped.
 */
export function capSelection(picked: readonly string[], maximum: number): string[] {
  const unique = [...new Set(picked)];
  return maximum > 0 && unique.length > maximum ? unique.slice(unique.length - maximum) : unique;
}
