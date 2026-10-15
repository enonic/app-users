import type { PrincipalKey, PrincipalRef } from './principal.types';

const SYSTEM_ROLE_PREFIX = 'role:system.';
const CMS_ROLE_PREFIX = 'role:cms.';
const PROJECT_ROLE_PREFIX = 'role:cms.project.';

/**
 * The project a role belongs to, or undefined when it belongs to none.
 *
 * A project role is keyed `role:cms.project.<id>.<projectRole>` where the trailing segment is one of
 * owner, editor, author, contributor or viewer. The id is everything in between, because a project
 * id may itself contain dots.
 */
export function projectRoleIdOf(key: PrincipalKey): string | undefined {
  if (!key.startsWith(PROJECT_ROLE_PREFIX)) {
    return undefined;
  }

  const rest = key.slice(PROJECT_ROLE_PREFIX.length);
  const lastDot = rest.lastIndexOf('.');
  return lastDot <= 0 ? undefined : rest.slice(0, lastDot);
}

/**
 * Roles that ship with the platform: `role:system.*`, and the `role:cms.*` ones that are not a
 * project's — `cms.admin`, `cms.cm.app`, `cms.expert`.
 *
 * Recognised by prefix rather than by an exhaustive list of `RoleKeys`, so a role XP adds later is
 * covered. The direction of the error matters: this also feeds `isReservedRole`, and holding back a
 * custom role is a nuisance where offering to delete a platform role is a broken instance.
 */
export function isPlatformRole(key: PrincipalKey): boolean {
  if (key.startsWith(PROJECT_ROLE_PREFIX)) {
    return false;
  }

  return key.startsWith(SYSTEM_ROLE_PREFIX) || key.startsWith(CMS_ROLE_PREFIX);
}

/**
 * Roles no administrator may delete: the platform's own, plus every project's five.
 *
 * ! The two are separate questions and only this one gates Delete. A project role is not a platform
 * ! role — it comes and goes with its project — but deleting one takes that project's access control
 * ! with it.
 */
export function isReservedRole(key: PrincipalKey): boolean {
  return isPlatformRole(key) || projectRoleIdOf(key) !== undefined;
}

/**
 * The two roles nobody can be put into: membership in them is implied rather than stored.
 *
 * ! They read back as ordinary roles, so `roles` lists them — but `FORBIDDEN_FROM_RELATIONSHIP` rejects
 * ! every relationship from either, so offering one offers a save that cannot succeed.
 */
export const IMPLICIT_ROLE_KEYS: ReadonlySet<string> = new Set([
  'role:system.everyone',
  'role:system.authenticated',
]);

/** The built-in store whose users are service accounts. It cannot be created, renamed or deleted. */
export const SYSTEM_ID_PROVIDER = 'system';

export const SUPER_USER_KEY = 'user:system:su';

/** The guest: it never signs in, so it has no credentials to edit. */
export const ANONYMOUS_USER_KEY = 'user:system:anonymous';

/**
 * The two users the platform owns and lib-admin-ui's `isSystem()` refuses to delete. Their memberships
 * are the platform's too: no picker offers them, since a membership stored on either is one XP never
 * resolves (enonic/xp#12443).
 */
export const SYSTEM_USER_KEYS: ReadonlySet<string> = new Set([SUPER_USER_KEY, ANONYMOUS_USER_KEY]);

/** Users the platform owns: `su` and `anonymous`, which may not be deleted. */
export function isSystemUser(key: PrincipalKey): boolean {
  return SYSTEM_USER_KEYS.has(key);
}

export function isAnonymousUser(key: PrincipalKey): boolean {
  return key === ANONYMOUS_USER_KEY;
}

export const ADMIN_ROLE_KEY = 'role:system.admin';

/**
 * Whether a membership is one the platform refuses to end: `su` leaving Administrators would lock the
 * last way back into the tool, and `SecurityServiceImpl` throws on it.
 */
export function isPinnedMembership(member: PrincipalKey, holder: PrincipalKey): boolean {
  return member === SUPER_USER_KEY && holder === ADMIN_ROLE_KEY;
}

/** A user of the system store: what the Service Accounts section lists (#2674). */
export function isServiceAccount(key: PrincipalKey): boolean {
  return key.startsWith(`user:${SYSTEM_ID_PROVIDER}:`);
}

/**
 * The principal's own name, which is what its key ends with: `alice`, `administrators`,
 * `cms.admin`. This is the string the real data carries and the one shown under a display name;
 * the provider it belongs to is provenance and goes in a meta cell instead.
 */
export function principalName(key: string): string {
  return key.slice(key.lastIndexOf(':') + 1);
}

/**
 * Provenance, read off the key: `user:system:su` and `group:system:administrators` both belong to
 * the `system` provider. A role belongs to none.
 */
export function idProviderOf(key: string): string | undefined {
  const [type, provider] = key.split(':');
  return type === 'role' ? undefined : provider;
}

/**
 * A principal known by its key alone, shown by its own name until — or unless — the server names it.
 * Undefined for a string that is no principal key: a stored reference is whatever the config carries.
 */
export function principalRefOf(key: string): PrincipalRef | undefined {
  const [type, ...rest] = key.split(':');

  if (rest.length === 0 || rest.some((part) => part.length === 0)) {
    return undefined;
  }

  if (type === 'role' && rest.length === 1) {
    return { type, key: `role:${rest[0]}`, displayName: rest[0] ?? '' };
  }

  if ((type === 'user' || type === 'group') && rest.length === 2) {
    return { type, key: `${type}:${rest[0]}:${rest[1]}`, displayName: rest[1] ?? '' };
  }

  return undefined;
}
