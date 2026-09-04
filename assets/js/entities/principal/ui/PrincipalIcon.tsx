import { Avatar, cn } from '@enonic/ui';
import { Settings, Users, UserShield, type LucideIcon } from 'lucide-react';

import { getInitials } from '../../../shared/format';
import { i18n } from '../../../shared/i18n';
import { IconBadge } from '../../../shared/ui/IconBadge';
import { isPlatformRole, isSystemUser } from '../model/principal.keys';
import type { PrincipalKey, PrincipalRef, PrincipalType } from '../model/principal.types';

export type PrincipalIconSize = 'sm' | 'lg';

export type PrincipalIconProps = {
  principal: PrincipalRef;
  /** `sm` for a list row, `lg` for the details header. */
  size?: PrincipalIconSize;
};

const GLYPHS: Record<Exclude<PrincipalType, 'user'>, LucideIcon> = {
  group: Users,
  role: UserShield,
};

const PIXELS: Record<PrincipalIconSize, number> = { sm: 28, lg: 48 };

// ? 28px is between the library's `sm` and `md`, so the avatar takes `md` for its type size and `size-7`
// ? for its box, which wins over the variant's `size-8` through tailwind-merge.
const AVATAR: Record<PrincipalIconSize, { size: 'md' | 'lg'; className?: string }> = {
  sm: { size: 'md', className: 'size-7' },
  lg: { size: 'lg' },
};

/** A user's initials, or the glyph for a group or role, with a cog badge on the ones the platform owns. */
export function PrincipalIcon({ principal, size = 'sm' }: PrincipalIconProps) {
  const { key, type, displayName } = principal;

  const icon = type === 'user' ? initialsAvatar(displayName, size) : glyph(type, size);

  const badgeLabelKey = systemBadgeKey(type, key);
  if (badgeLabelKey === undefined) {
    return icon;
  }

  return (
    <span className="relative inline-flex shrink-0">
      {icon}

      <IconBadge
        icon={Settings}
        color="var(--color-main)"
        size={size === 'lg' ? 'md' : 'sm'}
        label={i18n(badgeLabelKey)}
        className={cn(
          'absolute -top-0.75 -right-0.75',
          // ? Badge and avatar are the same black in the light theme; the ring is what separates them.
          type === 'user' && 'ring-surface-neutral ring-2',
        )}
      />
    </span>
  );
}

function initialsAvatar(displayName: string, size: PrincipalIconSize) {
  return (
    <Avatar {...AVATAR[size]} aria-hidden>
      {/* The fallback hardcodes `cursor-default`, an arrow over the avatar alone in a clickable row. */}
      <Avatar.Fallback className="cursor-[inherit]">{getInitials(displayName)}</Avatar.Fallback>
    </Avatar>
  );
}

function glyph(type: Exclude<PrincipalType, 'user'>, size: PrincipalIconSize) {
  const Glyph = GLYPHS[type];
  return <Glyph size={PIXELS[size]} strokeWidth={1.5} aria-hidden />;
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
