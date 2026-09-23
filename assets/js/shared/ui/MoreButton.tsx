export type MoreButtonProps = {
  label: string;
  onClick: () => void;
};

/** A `+N more` that reads like the text it replaces until hovered: no fill and no padding, so it lines up. */
export function MoreButton({ label, onClick }: MoreButtonProps) {
  return (
    <button
      type="button"
      className="text-subtle hover:text-main transition-highlight focus-visible:ring-ring cursor-pointer self-start rounded-sm text-sm underline-offset-3 hover:underline focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset focus-visible:outline-none"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
