export type ReadOnlyBannerProps = {
  title: string;
  /** What the operator can do about it, beside the title. */
  help?: string;
};

/** A strip stating that the section is read-only, in place of the action row. */
export function ReadOnlyBanner({ title, help }: ReadOnlyBannerProps) {
  return (
    <div className="bg-muted border-bdr-soft flex h-11 shrink-0 items-center justify-center gap-2 border-b px-5 text-sm">
      <span className="shrink-0 font-semibold">{title}</span>
      {help !== undefined && <span className="text-subtle truncate">{help}</span>}
    </div>
  );
}
