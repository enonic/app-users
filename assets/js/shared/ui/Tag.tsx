import { cn, IconButton } from '@enonic/ui';
import { X } from 'lucide-react';

export type TagProps = {
  label: string;
  /** What the label is a value of, shown before it: `Status: Installed`. */
  prefix?: string;
  onRemove?: () => void;
  /** Names the remove button, which is an icon with no text of its own. */
  removeLabel?: string;
  className?: string;
  'data-component'?: string;
};

const TAG_NAME = 'Tag';

export function Tag({
  label,
  prefix,
  onRemove,
  removeLabel,
  className,
  'data-component': componentName = TAG_NAME,
}: TagProps) {
  return (
    <span
      data-component={componentName}
      className={cn(
        'border-bdr-subtle text-main inline-flex max-w-full items-center gap-1 rounded-full border py-0.5 pl-2.5 text-sm',
        onRemove === undefined ? 'pr-2.5' : 'pr-0.5',
        className,
      )}
    >
      {prefix !== undefined && <span className="text-subtle shrink-0">{prefix}:</span>}
      <span className="truncate font-semibold">{label}</span>
      {onRemove !== undefined && (
        <IconButton
          icon={X}
          variant="text"
          size="sm"
          shape="round"
          iconSize={14}
          title={removeLabel}
          aria-label={removeLabel}
          onClick={onRemove}
          className="size-5 shrink-0"
        />
      )}
    </span>
  );
}

Tag.displayName = TAG_NAME;
