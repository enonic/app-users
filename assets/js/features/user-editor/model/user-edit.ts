import type { UserEdit } from '../../../entities/principal';
import { diffByKey } from '../../../shared/form';
import type { UserForm } from './user-form';

/**
 * The change an edit makes, as the update mutation wants it: the memberships as deltas against what
 * the server last answered, the password as the empty string when the wizard is clearing it, and the
 * disabled flag only when the edit flips it.
 *
 * ! Staged public keys are not here. They are written separately, once the user is.
 */
export function userEditFrom(form: UserForm, saved: UserForm): UserEdit {
  const roles = diffByKey(saved.roles, form.roles);
  const groups = diffByKey(saved.groups, form.groups);

  return {
    displayName: form.displayName,
    email: form.email,
    password: form.clearPassword === true ? '' : form.password,
    disabled: form.disabled === saved.disabled ? undefined : form.disabled,
    addRoles: roles.added,
    removeRoles: roles.removed,
    addGroups: groups.added,
    removeGroups: groups.removed,
  };
}
