import { createDetailLoader } from '../../../shared/detail';
import { fetchGroupDetail } from '../api/groups.api';
import type { GroupDetail } from './principal.types';

/**
 * The Groups details panel, loaded by key.
 *
 * Two calls per group answer the members and the roles, so the list carries neither and the panel asks
 * for the selected group alone. The debounce, the cancelling and the cache are `shared/detail`'s.
 */
const loader = createDetailLoader<GroupDetail>({
  load: (key, signal) => fetchGroupDetail(key, false, signal),
});

export const $groupDetail = loader.$detail;

export const showGroup = loader.show;

export const forgetGroups = loader.forget;

export const forgetGroupDetails = loader.invalidate;
