import { useStore } from '@nanostores/preact';

import { $groups, type GroupsState } from './groups.store';

/** A read. The Groups screen owns the load, since groups arrive beside their id providers. */
export function useGroups(): GroupsState {
  return useStore($groups);
}
