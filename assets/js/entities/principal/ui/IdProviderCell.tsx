import type { IdProviderLabel } from '../model/useIdProviderLabel';

/**
 * A provider in a browse list's provenance cell. The enclosing cell sets the colour, the size and the
 * right alignment, so this only stacks the two halves and keeps the pair inside a row's own height.
 */
export function IdProviderCell({ primary, secondary }: IdProviderLabel) {
  return (
    <span className="flex flex-col items-end">
      <span className="leading-4.5">{primary}</span>
      {secondary !== undefined && (
        <small className="text-xs leading-4 opacity-70">{secondary}</small>
      )}
    </span>
  );
}
