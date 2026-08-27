import { createDetailLoader } from '../../../shared/detail';
import { fetchRoleDetail } from '../api/roles.api';
import type { RoleDetail } from './principal.types';

/**
 * The Roles details panel, loaded by key.
 *
 * The list carries no members — one `getMembers` per row is what a list must never pay — so the panel
 * asks for the selected role and gets its scalars back along with them, for free. The debounce, the
 * cancelling and the cache are `shared/detail`'s.
 */
const loader = createDetailLoader<RoleDetail>({
  load: (key, signal) => fetchRoleDetail(key, signal),
});

export const $roleDetail = loader.$detail;

export const showRole = loader.show;

export const forgetRoles = loader.forget;

export const forgetRoleDetails = loader.invalidate;
