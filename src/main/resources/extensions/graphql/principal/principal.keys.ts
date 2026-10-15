import type { GroupKey, RoleKey, UserKey } from '/lib/xp/auth';

export const SYSTEM_ID_PROVIDER = 'system';

export const ADMIN_ROLE: RoleKey = 'role:system.admin';

export const SUPER_USER: UserKey = `user:${SYSTEM_ID_PROVIDER}:su`;

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
