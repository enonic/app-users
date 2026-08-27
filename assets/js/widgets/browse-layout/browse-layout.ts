const STORAGE_KEY = 'app-settings.browse-layout.details-width';

/** Content Studio's `PANEL_MIN_WIDTH` for the same two columns. */
export const MIN_LIST_WIDTH = 300;
export const MIN_DETAILS_WIDTH = 300;
export const DEFAULT_DETAILS_WIDTH = 400;

/** One arrow press on the handle. */
export const RESIZE_STEP = 16;

/** Neither column may squeeze the other below its minimum, whatever the drag asks for. */
export function clampDetailsWidth(width: number, containerWidth: number): number {
  const max = Math.max(MIN_DETAILS_WIDTH, containerWidth - MIN_LIST_WIDTH);
  return Math.round(Math.min(Math.max(width, MIN_DETAILS_WIDTH), max));
}

function storage(): Storage | undefined {
  return typeof localStorage === 'undefined' ? undefined : localStorage;
}

export function readDetailsWidth(): number {
  const stored = Number(storage()?.getItem(STORAGE_KEY));
  return Number.isFinite(stored) && stored > 0 ? stored : DEFAULT_DETAILS_WIDTH;
}

export function writeDetailsWidth(width: number): void {
  storage()?.setItem(STORAGE_KEY, String(width));
}
