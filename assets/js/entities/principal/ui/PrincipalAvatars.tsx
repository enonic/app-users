import { Tooltip } from '@enonic/ui';
import { useState } from 'preact/hooks';

import { DETAILS_LIST_PAGE_SIZE, nextPageSize } from '../../../shared/detail';
import { i18n } from '../../../shared/i18n';
import { MoreButton } from '../../../shared/ui/MoreButton';
import type { PrincipalRef } from '../model/principal.types';
import { sliceAvatars } from './principal-avatars';
import { PrincipalIcon } from './PrincipalIcon';

export type PrincipalAvatarsProps = {
  principals: readonly PrincipalRef[];
  /** The size of the whole set when `principals` is only the page of it that has been loaded. */
  total?: number;
  /** Avatars shown before the rest collapse into `+N more`. */
  max?: number;
  /** The caller pages: every avatar in `principals` is shown, and `+N more` asks for the next page. */
  onLoadMore?: () => void;
  /** A page is on its way: the control says so and ignores a click. */
  loadingMore?: boolean;
};

const TOOLTIP_DELAY = 300;

/** A wrapping row of avatars, one per principal, with a `+N more` for whatever did not fit. */
export function PrincipalAvatars({
  principals,
  total,
  max = DETAILS_LIST_PAGE_SIZE,
  onLoadMore,
  loadingMore,
}: PrincipalAvatarsProps) {
  const [visible, setVisible] = useState(max);

  const { shown, hidden } = sliceAvatars(
    principals,
    onLoadMore === undefined ? visible : principals.length,
    total,
  );
  // ? What a click can bring: avatars already in `principals`, or the rest of a set its caller pages.
  const next = onLoadMore === undefined ? principals.length - shown.length : hidden;

  const moreLabel = i18n('principal.avatars.more', next > 0 ? nextPageSize(next) : hidden);

  const handleMore = (): void => {
    if (onLoadMore === undefined) {
      setVisible((count) => count + DETAILS_LIST_PAGE_SIZE);
    } else if (loadingMore !== true) {
      onLoadMore();
    }
  };

  return (
    <ul className="flex flex-wrap items-center gap-2">
      {shown.map((principal) => (
        // ? The `li` is the trigger: a wrapping one would be ten more tab stops, and `PrincipalIcon`
        // ? is no `forwardRef` to take the ref itself.
        <Tooltip
          key={principal.key}
          value={principal.displayName}
          side="top"
          delay={TOOLTIP_DELAY}
          asChild
        >
          <li className="flex">
            <PrincipalIcon principal={principal} />
            <span className="sr-only">{principal.displayName}</span>
          </li>
        </Tooltip>
      ))}

      {hidden > 0 && (
        <li className="text-subtle text-sm">
          {next > 0 ? (
            <MoreButton
              label={loadingMore === true ? i18n('browse.list.loadingMore') : moreLabel}
              busy={loadingMore}
              onClick={handleMore}
            />
          ) : (
            moreLabel
          )}
        </li>
      )}
    </ul>
  );
}
