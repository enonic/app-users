import type { GroupKey, RoleKey, UserKey } from '/lib/xp/auth';

export const SYSTEM_ID_PROVIDER = 'system';

export const ADMIN_ROLE: RoleKey = 'role:system.admin';

export const SUPER_USER: UserKey = `user:${SYSTEM_ID_PROVIDER}:su`;

// ! The system users, implicit roles and platform-role prefixes below repeat the client's
// ! `assets/js/entities/principal/model/principal.keys.ts`, which the server bundle cannot import:
// ! change one and the other must follow, or the UI lock and the server refusal drift apart.
const SYSTEM_USERS: ReadonlySet<string> = new Set([
  SUPER_USER,
  `user:${SYSTEM_ID_PROVIDER}:anonymous`,
]);

/** `su` and `anonymous`, which the platform provisions and owns. */
export function isSystemUser(key: string): boolean {
  return SYSTEM_USERS.has(key);
}

const IMPLICIT_ROLES: ReadonlySet<string> = new Set([
  'role:system.everyone',
  'role:system.authenticated',
]);

/** Everyone and Authenticated, which nobody can be put into: membership in them is implied, not stored. */
export function isImplicitRole(key: string): boolean {
  return IMPLICIT_ROLES.has(key);
}

const SYSTEM_ROLE_PREFIX = 'role:system.';
const CMS_ROLE_PREFIX = 'role:cms.';
const PROJECT_ROLE_PREFIX = 'role:cms.project.';

/** Roles that ship with the platform, by prefix: never a project's. */
export function isPlatformRole(key: string): boolean {
  if (key.startsWith(PROJECT_ROLE_PREFIX)) {
    return false;
  }

  return key.startsWith(SYSTEM_ROLE_PREFIX) || key.startsWith(CMS_ROLE_PREFIX);
}

/**
 * Supersets of what XP accepts — `PrincipalKey.ofRole` and its siblings validate the id through
 * `ID_VALIDATOR`, which rejects spaces and HTML specials among others. These settle only which kind of
 * principal a key names; a key the platform will not parse fails later, on the platform's own terms.
 */
export const ROLE_KEY = /^role:[^:]+$/;
export const GROUP_KEY = /^group:[^:]+:[^:]+$/;
export const USER_KEY = /^user:[^:]+:[^:]+$/;

export type MemberKey = UserKey | GroupKey;

/**
 * ! The membership lists arrive as plain strings, and `addMembers` takes any principal key as the holder.
 * ! Parsing the kind here is what keeps a roles list from carrying a group — the write guards read the
 * ! provider off a *group* key, so a group smuggled in as a role would reach a locked provider unseen.
 */
export function toRoleKeys(keys: readonly string[]): RoleKey[] {
  return keys.map((key) => {
    if (!ROLE_KEY.test(key)) {
      throw new Error(`Not a role key: [${key}]`);
    }

    return key as RoleKey;
  });
}

export function toGroupKeys(keys: readonly string[]): GroupKey[] {
  return keys.map((key) => {
    if (!GROUP_KEY.test(key)) {
      throw new Error(`Not a group key: [${key}]`);
    }

    return key as GroupKey;
  });
}

/** What a group or a role may hold: users and groups, never a role. */
export function toMemberKeys(keys: readonly string[]): MemberKey[] {
  return keys.map((key) => {
    if (!USER_KEY.test(key) && !GROUP_KEY.test(key)) {
      throw new Error(`Not a user or group key: [${key}]`);
    }

    return key as MemberKey;
  });
}
