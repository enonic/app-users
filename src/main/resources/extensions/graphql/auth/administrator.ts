import { getMembers, hasRole, type GroupKey } from '/lib/xp/auth';

import { ADMIN_ROLE, GROUP_KEY } from '../principal/principal.keys';

/**
 * Whether the caller holds `role:system.admin`. Since enonic/xp#12615 the platform lets only such a
 * caller manage an ID provider, create a role in a reserved namespace, or change a principal that holds
 * the administrator role — whatever `role:system.user.admin` or a provider's ACL grants.
 */
export function isAdministratorCaller(): boolean {
  return hasRole(ADMIN_ROLE);
}

/**
 * Every principal that holds `role:system.admin`, directly or through groups, the role itself included.
 *
 * Walked down from the role rather than up from each principal: one walk answers for a whole list, and
 * the administrators are few where the principals asking may be many.
 */
export function adminHolderKeys(): ReadonlySet<string> {
  const holders = new Set<string>([ADMIN_ROLE]);
  const pending: string[] = [ADMIN_ROLE];

  for (let holder = pending.pop(); holder !== undefined; holder = pending.pop()) {
    getMembers(holder as GroupKey).forEach(({ key }) => {
      if (holders.has(key)) {
        return;
      }

      holders.add(key);
      if (GROUP_KEY.test(key)) {
        pending.push(key);
      }
    });
  }

  return holders;
}

const NOBODY: ReadonlySet<string> = new Set();

/** The principals the caller may not change: the holders for anyone but an administrator, who has none. */
export function administratorOnlyKeys(): ReadonlySet<string> {
  return isAdministratorCaller() ? NOBODY : adminHolderKeys();
}

/**
 * ! The refusals below repeat what `SecurityServiceImpl` would say, word for word, and exist for one
 * ! reason: a principal write is several platform calls with no transaction around them, so a refusal
 * ! the platform makes midway leaves the first half applied. Refusing here comes before the first write.
 */
export function requireModifiable(adminOnly: ReadonlySet<string>, keys: readonly string[]): void {
  const held = keys.find((key) => adminOnly.has(key));

  if (held !== undefined) {
    throw new Error(`[${held}] can only be modified by an administrator`);
  }
}

/** `holders` are the roles and groups whose member lists the write would change. */
export function requireChangeableMembers(
  adminOnly: ReadonlySet<string>,
  holders: readonly string[],
): void {
  const held = holders.find((key) => adminOnly.has(key));

  if (held !== undefined) {
    throw new Error(`Members of [${held}] can only be changed by an administrator`);
  }
}

export function requireIdProviderAdministrator(idProvider: string): void {
  if (!isAdministratorCaller()) {
    throw new Error(`[${idProvider}] id provider can only be managed by an administrator`);
  }
}
