import type { PrincipalKey } from './principal.types';

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

// The two users the platform owns and lib-admin-ui's `isSystem()` refuses to delete.
const SYSTEM_USER_KEYS = ['user:system:su', 'user:system:anonymous'];

/** Users the platform owns: `su` and `anonymous`, which may not be deleted. */
export function isSystemUser(key: PrincipalKey): boolean {
  return SYSTEM_USER_KEYS.includes(key);
}

/**
 * The principal's own name, which is what its key ends with: `alice`, `administrators`,
 * `cms.admin`. This is the string the real data carries and the one shown under a display name;
 * the provider it belongs to is provenance and goes in a meta cell instead.
 */
export function principalName(key: PrincipalKey): string {
  return key.slice(key.lastIndexOf(':') + 1);
}

/**
 * Provenance, read off the key: `user:system:su` and `group:system:administrators` both belong to
 * the `system` provider. A role belongs to none.
 */
export function idProviderOf(key: PrincipalKey): string | undefined {
  const [type, provider] = key.split(':');
  return type === 'role' ? undefined : provider;
}
