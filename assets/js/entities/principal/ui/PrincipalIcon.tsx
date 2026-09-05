import { Avatar, cn } from '@enonic/ui';
import { Settings, Users, UserShield, type LucideIcon } from 'lucide-react';

import { getInitials } from '../../../shared/format';
import { i18n } from '../../../shared/i18n';
import { IconBadge } from '../../../shared/ui/IconBadge';
import { isPlatformRole, isSystemUser } from '../model/principal.keys';
import type { PrincipalKey, PrincipalRef, PrincipalType } from '../model/principal.types';

export type PrincipalIconSize = 'xs' | 'sm' | 'lg';

export type PrincipalIconProps = {
  principal: PrincipalRef;
  /** `xs` inline in text, `sm` for a list row, `lg` for the details header. */
  size?: PrincipalIconSize;
};

const GLYPHS: Record<Exclude<PrincipalType, 'user'>, LucideIcon> = {
  group: Users,
  role: UserShield,
};

const PIXELS: Record<PrincipalIconSize, number> = { xs: 18, sm: 28, lg: 48 };

// ? 28px is between the library's `sm` and `md`, so the avatar takes `md` for its type size and `size-7`
// ? for its box, which wins over the variant's `size-8` through tailwind-merge.
const AVATAR: Record<PrincipalIconSize, { size: 'sm' | 'md' | 'lg'; className?: string }> = {
  xs: { size: 'sm', className: 'size-4.5' },
  sm: { size: 'md', className: 'size-7' },
  lg: { size: 'lg' },
};

/**
 * ! The cog carries no disc — it is drawn in `currentColor`, same as the glyph, so both follow the row's
 * ! text color together (`text-alt` on the inverse selected row included). What keeps the icon from
 * ! crossing it is this notch, cut out of the icon alone: a hole centred where the badge sits — badge
 * ! box offset -3px into the corner, so sm (14px box on a 28px icon) centres at 24,4 and lg (18px box
 * ! on 48px) at 42,6 — with the radius leaving ~2px of clear ground around the cog on any background.
 * ! The avatar and the glyph share a box per size, so one notch fits both.
 */
const NOTCH: Record<PrincipalIconSize, string> = {
  xs: '[mask-image:radial-gradient(circle_at_14px_4px,transparent_7px,#000_7.5px)]',
  sm: '[mask-image:radial-gradient(circle_at_24px_4px,transparent_7px,#000_7.5px)]',
  lg: '[mask-image:radial-gradient(circle_at_42px_6px,transparent_9px,#000_9.5px)]',
};

/** A user's initials, or the glyph for a group or role, with a cog badge on the ones the platform owns. */
export function PrincipalIcon({ principal, size = 'sm' }: PrincipalIconProps) {
  const { key, type, displayName } = principal;

  const badgeLabelKey = systemBadgeKey(type, key);
  if (badgeLabelKey === undefined) {
    return icon(type, displayName, size);
  }

  return (
    <span className="relative inline-flex shrink-0">
      {icon(type, displayName, size, NOTCH[size])}

      <IconBadge
        icon={Settings}
        size={size === 'lg' ? 'md' : 'sm'}
        label={i18n(badgeLabelKey)}
        className="absolute -top-0.75 -right-0.75 text-current"
      />
    </span>
  );
}

function icon(
  type: PrincipalType,
  displayName: string,
  size: PrincipalIconSize,
  className?: string,
) {
  return type === 'user'
    ? initialsAvatar(displayName, size, className)
    : glyph(type, size, className);
}

function initialsAvatar(displayName: string, size: PrincipalIconSize, className?: string) {
  const { size: avatarSize, className: box } = AVATAR[size];
  return (
    <Avatar size={avatarSize} className={cn(box, className)} aria-hidden>
      {/* The fallback hardcodes `cursor-default`, an arrow over the avatar alone in a clickable row. */}
      <Avatar.Fallback className="cursor-[inherit]">{getInitials(displayName)}</Avatar.Fallback>
    </Avatar>
  );
}

function glyph(type: Exclude<PrincipalType, 'user'>, size: PrincipalIconSize, className?: string) {
  const Glyph = GLYPHS[type];
  return <Glyph size={PIXELS[size]} strokeWidth={1.5} aria-hidden className={className} />;
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
