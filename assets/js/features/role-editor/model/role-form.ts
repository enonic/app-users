import {
  derivePrincipalName,
  isIllegalPrincipalName,
  type PrincipalRef,
  type Role,
} from '../../../entities/principal';
import { sameKeys, type FieldErrors } from '../../../shared/form';
import type { RoleEditorPayload } from './role-editor.store';

export type RoleForm = {
  name: string;
  displayName: string;
  description: string;
  members: readonly PrincipalRef[];
};

export type RoleFormField = 'name' | 'displayName';

export type RoleFormErrors = FieldErrors<RoleFormField>;

export const ROLE_FORM_FIELDS: readonly RoleFormField[] = ['name', 'displayName'];

export type RoleFormChange = {
  values: RoleForm;
  nameEdited: boolean;
};

export function initialRoleForm(
  payload: RoleEditorPayload,
  members: readonly PrincipalRef[] = [],
): RoleForm {
  if (payload.mode === 'create') {
    return { name: '', displayName: '', description: '', members: [] };
  }

  return {
    name: roleNameOf(payload.role),
    displayName: payload.role.displayName,
    description: payload.role.description ?? '',
    members,
  };
}

export function roleNameOf(role: Role): string {
  return role.key.slice('role:'.length);
}

export function nextRoleForm(
  previous: RoleForm,
  next: RoleForm,
  mode: RoleEditorPayload['mode'],
  nameEdited: boolean,
): RoleFormChange {
  if (next.name !== previous.name) {
    return { values: next, nameEdited: true };
  }

  if (nameEdited || mode === 'edit') {
    return { values: next, nameEdited };
  }

  return { values: { ...next, name: derivePrincipalName(next.displayName) }, nameEdited: false };
}

/**
 * Whether the form still says what was saved.
 *
 * Compared the way the form is sent: the scalars trimmed, since the command trims them, and the members
 * as a set, since their order is not part of what a role holds.
 */
export function sameRoleForm(saved: RoleForm, edited: RoleForm): boolean {
  return (
    saved.name.trim() === edited.name.trim() &&
    saved.displayName.trim() === edited.displayName.trim() &&
    saved.description.trim() === edited.description.trim() &&
    sameKeys(saved.members, edited.members)
  );
}

export function validateRoleForm(form: RoleForm, mode: RoleEditorPayload['mode']): RoleFormErrors {
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
