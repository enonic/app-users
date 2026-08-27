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

/** The glyph for a principal's type, with a cog badge on the ones the platform owns. */
export function PrincipalIcon({ principal, size = 'sm' }: PrincipalIconProps) {
  const { key, type } = principal;

  const Glyph = GLYPHS[type];
  const glyph = <Glyph size={PIXELS[size]} strokeWidth={1.5} aria-hidden />;

  const badgeLabelKey = systemBadgeKey(type, key);
  if (badgeLabelKey === undefined) {
    return glyph;
  }

  return (
    <span className="relative inline-flex shrink-0">
      {glyph}

      <IconBadge
        icon={Settings}
        color="var(--color-main)"
        size={size === 'lg' ? 'md' : 'sm'}
        label={i18n(badgeLabelKey)}
        className="absolute -top-0.75 -right-0.75"
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
