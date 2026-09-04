export type AvatarSlice<T> = {
  shown: readonly T[];
  /** How many the `+N` after the row stands for. */
  hidden: number;
};

/** The first `max` avatars and the count of the rest, off `total` when `items` is only a loaded page. */
export function sliceAvatars<T>(items: readonly T[], max: number, total?: number): AvatarSlice<T> {
  const shown = items.slice(0, max);
  const hidden = Math.max(total ?? items.length, items.length) - shown.length;

  return { shown, hidden };
}
