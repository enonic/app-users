import type { GroupEdit } from '../../../entities/principal';
import { diffByKey } from '../../../shared/form';
import type { GroupForm } from './group-form';

/**
 * The change an edit makes, as the update mutation wants it: the two lists as deltas against what the
 * server last answered.
 */
export function groupEditFrom(form: GroupForm, saved: GroupForm): GroupEdit {
  const members = diffByKey(saved.members, form.members);
  const roles = diffByKey(saved.roles, form.roles);

  return {
    displayName: form.displayName,
    description: form.description,
    addMembers: members.added,
    removeMembers: members.removed,
    addRoles: roles.added,
    removeRoles: roles.removed,
  };
}
