import { hasRole } from '/lib/xp/auth';

/**
 * Whether the caller may only look: the section admits `system.user.app` for reading, and writing takes
 * `system.user.admin` or `system.admin`. What takes `system.admin` alone is in `administrator.ts`.
 */
export function isReadOnlyCaller(): boolean {
  return !hasRole('role:system.admin') && !hasRole('role:system.user.admin');
}
