import { Avatar } from '@enonic/ui';
import { UserCog, Users, UserShield, type LucideIcon } from 'lucide-react';

import { getInitials } from '../../../shared/format';
import { isServiceAccount } from '../model/principal.keys';
import type { PrincipalRef, PrincipalType } from '../model/principal.types';

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

/** A user's initials, or the glyph for a service account, group or role. */
export function PrincipalIcon({ principal, size = 'sm' }: PrincipalIconProps) {
  const { key, type, displayName } = principal;

  // A service account gets its section's glyph, not initials.
  if (type === 'user' && isServiceAccount(key)) {
    return glyph(UserCog, size);
  }

  return type === 'user' ? initialsAvatar(displayName, size) : glyph(GLYPHS[type], size);
}

function initialsAvatar(displayName: string, size: PrincipalIconSize) {
  const { size: avatarSize, className: box } = AVATAR[size];
  return (
    <Avatar size={avatarSize} className={box} aria-hidden>
      {/* The fallback hardcodes `cursor-default`, an arrow over the avatar alone in a clickable row. */}
      <Avatar.Fallback className="cursor-[inherit]">{getInitials(displayName)}</Avatar.Fallback>
    </Avatar>
  );
}

function glyph(Glyph: LucideIcon, size: PrincipalIconSize) {
  return <Glyph size={PIXELS[size]} strokeWidth={1.5} aria-hidden />;
}
