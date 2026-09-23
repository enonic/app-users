import { ListItem, Separator } from '@enonic/ui';
import type { ReactNode } from 'react';

import { useLoadMore } from '../../shared/detail';
import { useI18n } from '../../shared/i18n';
import { ItemLabel } from '../../shared/ui/ItemLabel';
import { MoreButton } from '../../shared/ui/MoreButton';
import { withCount } from './details-panel';
import { DetailsEmpty } from './DetailsEmpty';
import { DetailsSkeleton } from './DetailsSkeleton';

export type DetailsPanelProps = {
  children: ReactNode;
};

export type DetailsHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  /** Inline after the title, e.g. a link out to the item's page on another site. */
  titleAction?: ReactNode;
  /** Under the title block, e.g. the Applications state dropdown. */
  action?: ReactNode;
};

export type DetailsSectionProps = {
  labelKey: string;
  /** Appended to the label as `(7)`. */
  count?: number;
  /** Rendered at the end of the section, e.g. the Edit button. */
  action?: ReactNode;
  /**
   * Optional, because a section whose size is known before its contents are is a heading and a
   * number on its own — `Users (4213)` says something, an empty list under it does not.
   */
  children?: ReactNode;
};

export type DetailsSubsectionProps = {
  labelKey: string;
  /** Appended to the label as `(6)`. */
  count?: number;
  children: ReactNode;
};

export type DetailsFieldProps = {
  labelKey: string;
  children: ReactNode;
};

export type DetailsListProps<T> = {
  items: readonly T[];
  /** The size of the whole set when `items` is only the page of it that was loaded. */
  total?: number;
  /** The caller pages: every row in `items` is shown, and `+N more` asks for the next page. */
  onLoadMore?: () => void;
  /** A page is on its way: the control says so and ignores a click. */
  loadingMore?: boolean;
  children: (item: T) => ReactNode;
};

export type DetailsListItemProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  /** Right-aligned, single cell — not the array `BrowseRow.meta` uses. */
  meta?: ReactNode;
};

function DetailsPanelRoot({ children }: DetailsPanelProps) {
  return <div className="flex min-h-0 flex-col gap-5 overflow-auto p-10">{children}</div>;
}

export function DetailsHeader({ title, subtitle, icon, titleAction, action }: DetailsHeaderProps) {
  return (
    <div className="flex items-center gap-5">
      {icon && <div className="flex size-12 shrink-0 items-center justify-center">{icon}</div>}

      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-2xl font-semibold">{title}</h3>
          {titleAction}
        </div>

        {subtitle && <p className="text-subtle truncate text-base">{subtitle}</p>}

        {action && <div className="flex">{action}</div>}
      </div>
    </div>
  );
}

export function DetailsSection({ labelKey, count, action, children }: DetailsSectionProps) {
  const label = useI18n(labelKey);

  return (
    <section className="flex flex-col gap-2.5">
      <Separator label={withCount(label, count)} className="text-base" />
      {children}
      {action && <div className="flex justify-end">{action}</div>}
    </section>
  );
}

export function DetailsSubsection({ labelKey, count, children }: DetailsSubsectionProps) {
  const label = useI18n(labelKey);

  return (
    <div className="flex flex-col gap-2.5">
      <h4 className="text-sm font-semibold">{withCount(label, count)}</h4>
      {children}
    </div>
  );
}

export function DetailsField({ labelKey, children }: DetailsFieldProps) {
  const label = useI18n(labelKey);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold">{label}</span>
      <span className="text-xs font-normal wrap-anywhere">{children}</span>
    </div>
  );
}

export function DetailsList<T>({
  items,
  total,
  onLoadMore,
  loadingMore,
  children,
}: DetailsListProps<T>) {
  const { visible, hiddenCount, nextCount, loadMore } = useLoadMore(items, { total, onLoadMore });

  const moreLabel = useI18n('browse.details.more', nextCount);
  const loadingMoreLabel = useI18n('browse.list.loadingMore');

  const handleMore = (): void => {
    if (loadingMore !== true) {
      loadMore();
    }
  };

  // ? A sibling of the list rather than a row in it: `role="list"` takes list items and nothing else.
  return (
    <>
      <div role="list" className="flex flex-col">
        {visible.map(children)}
      </div>

      {hiddenCount > 0 && (
        <MoreButton
          label={loadingMore === true ? loadingMoreLabel : moreLabel}
          busy={loadingMore}
          onClick={handleMore}
        />
      )}
    </>
  );
}

export function DetailsListItem({ title, subtitle, icon, meta }: DetailsListItemProps) {
  return (
    <ListItem className="px-0">
      <ListItem.Content>
        <ItemLabel icon={icon} primary={title} secondary={subtitle} />
      </ListItem.Content>
      <ListItem.Right>
        {meta && <span className="text-subtle text-sm whitespace-nowrap">{meta}</span>}
      </ListItem.Right>
    </ListItem>
  );
}

export const DetailsPanel = Object.assign(DetailsPanelRoot, {
  Empty: DetailsEmpty,
  Skeleton: DetailsSkeleton,
  Header: DetailsHeader,
  Section: DetailsSection,
  Subsection: DetailsSubsection,
  Field: DetailsField,
  List: DetailsList,
  ListItem: DetailsListItem,
});
