import {
  derivePrincipalName,
  idProviderOf,
  isIllegalPrincipalName,
  type PrincipalRef,
} from '../../../entities/principal';
import { sameKeys, type FieldErrors } from '../../../shared/form';
import { isPasswordAccepted, passwordStrength } from './password-strength';
import type { UserEditorPayload } from './user-editor.store';

export type UserForm = {
  idProvider: string;
  name: string;
  displayName: string;
  email: string;
  password?: string;
  clearPassword?: boolean;
  roles: readonly PrincipalRef[];
  groups: readonly PrincipalRef[];
};

export type UserFormField = 'idProvider' | 'name' | 'displayName' | 'email' | 'password';

export type UserFormErrors = FieldErrors<UserFormField>;

export const USER_FORM_FIELDS: readonly UserFormField[] = [
  'idProvider',
  'name',
  'displayName',
  'email',
  'password',
];

export type UserFormChange = {
  values: UserForm;
  nameEdited: boolean;
};

export const SYSTEM_ID_PROVIDER = 'system';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function initialUserForm(
  payload: UserEditorPayload,
  defaultProvider = '',
  memberships: { roles?: readonly PrincipalRef[]; groups?: readonly PrincipalRef[] } = {},
): UserForm {
  if (payload.mode === 'create') {
    return {
      idProvider: defaultProvider,
      name: '',
      displayName: '',
      email: '',
      roles: [],
      groups: [],
    };
  }

  const { user } = payload;

  return {
    idProvider: idProviderOf(user.key) ?? '',
    name: user.login,
    displayName: user.displayName,
    email: user.email ?? '',
    roles: memberships.roles ?? [],
    groups: memberships.groups ?? [],
  };
}

export function nextUserForm(
  previous: UserForm,
  next: UserForm,
  mode: UserEditorPayload['mode'],
  nameEdited: boolean,
): UserFormChange {
  if (next.name !== previous.name) {
    return { values: next, nameEdited: true };
  }

  if (nameEdited || mode === 'edit') {
    return { values: next, nameEdited };
  }

  return { values: { ...next, name: derivePrincipalName(next.displayName) }, nameEdited: false };
}

export function sameUserForm(saved: UserForm, edited: UserForm): boolean {
  return (
    edited.password === undefined &&
    edited.clearPassword !== true &&
    saved.idProvider === edited.idProvider &&
    saved.name.trim() === edited.name.trim() &&
    saved.displayName.trim() === edited.displayName.trim() &&
    saved.email.trim() === edited.email.trim() &&
    sameKeys(saved.roles, edited.roles) &&
    sameKeys(saved.groups, edited.groups)
  );
}

export function validateUserForm(
  form: UserForm,
  mode: UserEditorPayload['mode'],
  systemUser: boolean,
): UserFormErrors {
  const errors: UserFormErrors = {};

  if (form.displayName.trim().length === 0) {
    errors.displayName = 'users.dialog.displayNameRequired';
  }

  if (mode === 'create') {
    const name = form.name.trim();
    if (name.length === 0) {
      errors.name = 'users.dialog.nameRequired';
    } else if (isIllegalPrincipalName(name)) {
      errors.name = 'users.dialog.nameInvalid';
    }
  }

  if (!systemUser) {
    const email = form.email.trim();
    if (email.length === 0) {
      errors.email = 'users.dialog.emailRequired';
    } else if (!EMAIL.test(email)) {
      errors.email = 'users.dialog.emailInvalid';
    }
  }

  if (mode === 'create' && form.idProvider.length === 0) {
    errors.idProvider = 'users.dialog.idProviderRequired';
  }

  if (form.password !== undefined) {
    if (form.password.length === 0) {
      errors.password = 'users.dialog.passwordRequired';
    } else if (/\s/.test(form.password)) {
      errors.password = 'users.dialog.passwordSpaces';
    } else if (!isPasswordAccepted(passwordStrength(form.password))) {
      errors.password = 'users.dialog.passwordTooWeak';
    }
  }

  return errors;
}

export function showsPublicKeys(form: UserForm): boolean {
  return form.idProvider === SYSTEM_ID_PROVIDER;
}

export type PasswordAction = 'set' | 'change';

export function passwordActions(hasPassword: boolean): {
  action: PasswordAction;
  clearable: boolean;
} {
  return { action: hasPassword ? 'change' : 'set', clearable: hasPassword };
}
