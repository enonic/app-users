import { useStore } from '@nanostores/preact';

import { $roles, type RolesState } from './roles.store';

/** A read. The Roles screen owns the load, since roles never arrive on their own. */
export function useRoles(): RolesState {
  return useStore($roles);
}
