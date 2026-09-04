import { Tooltip } from '@enonic/ui';

import { i18n } from '../../../shared/i18n';
import type { PrincipalRef } from '../model/principal.types';
import { sliceAvatars } from './principal-avatars';
import { PrincipalIcon } from './PrincipalIcon';

export type PrincipalAvatarsProps = {
  principals: readonly PrincipalRef[];
  /** The size of the whole set when `principals` is only the page of it that has been loaded. */
  total?: number;
  /** Avatars shown before the rest collapse into `+N`. */
  max?: number;
};

const DEFAULT_MAX = 10;
const TOOLTIP_DELAY = 300;

/** A wrapping row of avatars, one per principal, with a `+N` for whatever did not fit. */
export function PrincipalAvatars({ principals, total, max = DEFAULT_MAX }: PrincipalAvatarsProps) {
  const { shown, hidden } = sliceAvatars(principals, max, total);

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

      {hidden > 0 && <li className="text-sm">{i18n('principal.avatars.more', hidden)}</li>}
    </ul>
  );
}
