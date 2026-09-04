import { Settings, User, Users, UserShield, type LucideIcon } from 'lucide-react';

import { i18n } from '../../../shared/i18n';
import { IconBadge } from '../../../shared/ui/IconBadge';
import { isPlatformRole, isSystemUser } from '../model/principal.keys';
import type { PrincipalKey, PrincipalRef, PrincipalType } from '../model/principal.types';

export type PrincipalIconProps = {
  principal: Pick<PrincipalRef, 'key' | 'type'>;
  /** `sm` for a list row, `lg` for the details header. */
  size?: 'sm' | 'lg';
};

const GLYPHS: Record<PrincipalType, LucideIcon> = {
  user: User,
  group: Users,
  role: UserShield,
};

const PIXELS = { sm: 24, lg: 48 } as const;

/**
 * ! The cog carries no disc — it is drawn in `currentColor`, same as the glyph, so both follow the row's
 * ! text color together (`text-alt` on the inverse selected row included). What keeps the glyph's strokes
 * ! from crossing it is this notch, cut out of the glyph alone: a hole centred where the badge sits —
 * ! badge box offset -3px into the corner, so sm (14px box on a 24px glyph) centres at 20,4 and lg (18px
 * ! box on 48px) at 42,6 — with the radius leaving ~2px of clear ground around the cog on any background.
 */
const NOTCH = {
  sm: '[mask-image:radial-gradient(circle_at_20px_4px,transparent_7px,#000_7.5px)]',
  lg: '[mask-image:radial-gradient(circle_at_42px_6px,transparent_9px,#000_9.5px)]',
} as const;

/** The glyph for a principal's type, with a cog badge on the ones the platform owns. */
export function PrincipalIcon({ principal, size = 'sm' }: PrincipalIconProps) {
  const { key, type } = principal;

  const Glyph = GLYPHS[type];

  const badgeLabelKey = systemBadgeKey(type, key);
  if (badgeLabelKey === undefined) {
    return <Glyph size={PIXELS[size]} strokeWidth={1.5} aria-hidden />;
  }

  return (
    <span className="relative inline-flex shrink-0">
      <Glyph size={PIXELS[size]} strokeWidth={1.5} aria-hidden className={NOTCH[size]} />

      <IconBadge
        icon={Settings}
        size={size === 'lg' ? 'md' : 'sm'}
        label={i18n(badgeLabelKey)}
        className="absolute -top-0.75 -right-0.75 text-current"
      />
    </span>
  );
}

/**
 * The principals the platform owns rather than an administrator: `su` and `anonymous`, and the roles
 * that ship with it. A group has no such reading — every group is created, none is shipped.
 *
 * ? Platform roles rather than the `role:system.` prefix alone, so the badge and the roles section's
 * ? own System filter answer the same question: `cms.admin` is as much the platform's as `system.admin`.
 */
function systemBadgeKey(type: PrincipalType, key: PrincipalKey): string | undefined {
  if (type === 'user' && isSystemUser(key)) {
    return 'principal.badge.systemUser';
  }

  return type === 'role' && isPlatformRole(key) ? 'principal.badge.systemRole' : undefined;
}
