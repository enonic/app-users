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
};

const TOOLTIP_DELAY = 300;

/** A wrapping row of avatars, one per principal, with a `+N more` for whatever did not fit. */
export function PrincipalAvatars({
  principals,
  total,
  max = DETAILS_LIST_PAGE_SIZE,
}: PrincipalAvatarsProps) {
  const [visible, setVisible] = useState(max);

  const { shown, hidden } = sliceAvatars(principals, visible, total);
  // ? Only avatars already in `principals` can be shown on a click; a paged set just counts the rest.
  const loaded = principals.length - shown.length;

  const moreLabel = i18n('principal.avatars.more', loaded > 0 ? nextPageSize(loaded) : hidden);

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
          {loaded > 0 ? (
            <MoreButton
              label={moreLabel}
              onClick={() => setVisible((count) => count + DETAILS_LIST_PAGE_SIZE)}
            />
          ) : (
            moreLabel
          )}
        </li>
      )}
    </ul>
  );
}
