import {
  derivePrincipalName,
  idProviderOf,
  isIllegalPrincipalName,
  principalName,
  type PrincipalRef,
} from '../../../entities/principal';
import { sameKeys, type FieldErrors } from '../../../shared/form';
import type { GroupEditorPayload } from './group-editor.store';

export type GroupForm = {
  idProvider: string;
  name: string;
  displayName: string;
  description: string;
  members: readonly PrincipalRef[];
  roles: readonly PrincipalRef[];
};

export type GroupFormField = 'idProvider' | 'name' | 'displayName';

export type GroupFormErrors = FieldErrors<GroupFormField>;

export const GROUP_FORM_FIELDS: readonly GroupFormField[] = ['idProvider', 'name', 'displayName'];

export type GroupFormChange = {
  values: GroupForm;
  nameEdited: boolean;
};

export function initialGroupForm(
  payload: GroupEditorPayload,
  defaultProvider = '',
  members: readonly PrincipalRef[] = [],
  roles: readonly PrincipalRef[] = [],
): GroupForm {
  if (payload.mode === 'create') {
    return {
      idProvider: defaultProvider,
      name: '',
      displayName: '',
      description: '',
      members: [],
      roles: [],
    };
  }

  const { group } = payload;

  return {
    idProvider: idProviderOf(group.key) ?? '',
    name: principalName(group.key),
    displayName: group.displayName,
    description: group.description ?? '',
    members,
    roles,
  };
}

export function nextGroupForm(
  previous: GroupForm,
  next: GroupForm,
  mode: GroupEditorPayload['mode'],
  nameEdited: boolean,
): GroupFormChange {
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
 * Compared the way the form is sent: the scalars trimmed, since the command trims them, and both lists
 * as sets, since their order is not part of what a group holds. The provider and the name are in the
 * key and cannot move once the group exists, so an edit that differs in nothing else is no edit.
 */
export function sameGroupForm(saved: GroupForm, edited: GroupForm): boolean {
  return (
    saved.idProvider === edited.idProvider &&
    saved.name.trim() === edited.name.trim() &&
    saved.displayName.trim() === edited.displayName.trim() &&
    saved.description.trim() === edited.description.trim() &&
    sameKeys(saved.members, edited.members) &&
    sameKeys(saved.roles, edited.roles)
  );
}

export function validateGroupForm(
  form: GroupForm,
  mode: GroupEditorPayload['mode'],
): GroupFormErrors {
  const errors: GroupFormErrors = {};

  if (form.displayName.trim().length === 0) {
    errors.displayName = 'groups.dialog.displayNameRequired';
  }

  if (mode === 'create') {
    if (form.idProvider.length === 0) {
      errors.idProvider = 'groups.dialog.idProviderRequired';
    }

    const name = form.name.trim();
    if (name.length === 0) {
      errors.name = 'groups.dialog.nameRequired';
    } else if (isIllegalPrincipalName(name)) {
      errors.name = 'groups.dialog.nameInvalid';
    }
  }

  return errors;
}
