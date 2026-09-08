import type { RoleEdit } from '../../../entities/principal';
import { diffByKey } from '../../../shared/form';
import type { RoleForm } from './role-form';

/**
 * The change an edit makes, as the update mutation wants it: the members as a delta against what the
 * server last answered.
 */
export function roleEditFrom(form: RoleForm, saved: RoleForm): RoleEdit {
  const members = diffByKey(saved.members, form.members);

  return {
    displayName: form.displayName,
    description: form.description,
    addMembers: members.added,
    removeMembers: members.removed,
  };
}
