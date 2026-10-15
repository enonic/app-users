import { hasRole } from '/lib/xp/auth';

/**
 * Whether the caller may only look: the section admits `system.user.app` for reading, and writing — or
 * reading what only a writer needs, an id provider's configuration — takes an administrator's role.
 */
export function isReadOnlyCaller(): boolean {
  return !hasRole('role:system.admin') && !hasRole('role:system.user.admin');
}
