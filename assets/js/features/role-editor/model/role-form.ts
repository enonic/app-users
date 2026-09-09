import {
  derivePrincipalName,
  isIllegalPrincipalName,
  principalName,
  type PrincipalRef,
  type Role,
} from '../../../entities/principal';
import { sameKeys, type FieldErrors } from '../../../shared/form';
import type { StepDialogMode, StepDialogPayload } from '../../../shared/step-dialog';

export type RoleEditorPayload = StepDialogPayload<Role>;

export type RoleForm = {
  name: string;
  displayName: string;
  description: string;
  members: readonly PrincipalRef[];
  /** Whether the user has taken the name over; until then a create derives it from the display name. */
  nameEdited?: boolean;
};

export type RoleFormField = 'name' | 'displayName';

export type RoleFormErrors = FieldErrors<RoleFormField>;

export const ROLE_FORM_FIELDS: readonly RoleFormField[] = ['name', 'displayName'];

export function initialRoleForm(
  payload: RoleEditorPayload,
  members: readonly PrincipalRef[] = [],
): RoleForm {
  if (payload.mode === 'create') {
    return { name: '', displayName: '', description: '', members: [] };
  }

  const { entity: role } = payload;

  return {
    name: principalName(role.key),
    displayName: role.displayName,
    description: role.description ?? '',
    members,
  };
}

export function nextRoleForm(
  previous: RoleForm,
  next: RoleForm,
  { mode }: { mode: StepDialogMode },
): RoleForm {
  if (next.name !== previous.name) {
    return { ...next, nameEdited: true };
  }

  if (next.nameEdited === true || mode === 'edit') {
    return next;
  }

  return { ...next, name: derivePrincipalName(next.displayName) };
}

/**
 * Whether the form still says what was saved.
 *
 * Compared the way the form is sent: the scalars trimmed, since the command trims them, and the members
 * as a set, since their order is not part of what a role holds. The name is the key and cannot move once
 * the role exists, so an edit that differs in nothing else is no edit.
 */
export function sameRoleForm(saved: RoleForm, edited: RoleForm): boolean {
  return (
    saved.name.trim() === edited.name.trim() &&
    saved.displayName.trim() === edited.displayName.trim() &&
    saved.description.trim() === edited.description.trim() &&
    sameKeys(saved.members, edited.members)
  );
}

export function validateRoleForm(form: RoleForm, mode: StepDialogMode): RoleFormErrors {
  const errors: RoleFormErrors = {};

  if (form.displayName.trim().length === 0) {
    errors.displayName = 'roles.dialog.displayNameRequired';
  }

  if (mode === 'create') {
    const name = form.name.trim();
    if (name.length === 0) {
      errors.name = 'roles.dialog.nameRequired';
    } else if (isIllegalPrincipalName(name)) {
      errors.name = 'roles.dialog.nameInvalid';
    }
  }

  return errors;
}
