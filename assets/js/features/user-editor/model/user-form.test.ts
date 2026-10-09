import { describe, expect, it } from 'vitest';

import type { PrincipalRef, User } from '../../../entities/principal';
import {
  USER_FORM_FIELDS,
  initialUserForm,
  nextUserForm,
  passwordActions,
  showsPublicKeys,
  sameUserForm,
  validateUserForm,
  type UserForm,
} from './user-form';

const user = {
  type: 'user',
  key: 'user:store:alice',
  displayName: 'Alice Anderson',
  login: 'alice',
  email: 'alice@example.com',
  hasPassword: true,
} as unknown as User;

function form(overrides: Partial<UserForm> = {}): UserForm {
  return {
    idProvider: 'store',
    name: 'alice',
    displayName: 'Alice Anderson',
    email: 'alice@example.com',
    roles: [],
    groups: [],
    keyAdditions: [],
    keyRemovals: [],
    ...overrides,
  };
}

describe('initialUserForm', () => {
  it('starts empty for a new user, on the provider it was given', () => {
    expect(initialUserForm({ mode: 'create' }, 'store')).toEqual({
      idProvider: 'store',
      name: '',
      displayName: '',
      email: '',
      roles: [],
      groups: [],
      keyAdditions: [],
      keyRemovals: [],
    });
  });

  it('takes the name from the login, not from the key', () => {
    expect(initialUserForm({ mode: 'edit', entity: user }).name).toBe('alice');
  });

  it('reads the provider out of the key', () => {
    expect(initialUserForm({ mode: 'edit', entity: user }).idProvider).toBe('store');
  });

  it('takes the memberships it is handed', () => {
    const roles = [{ key: 'role:cms.admin', type: 'role', displayName: 'CS Admin' }] as const;

    expect(initialUserForm({ mode: 'edit', entity: user }, '', { roles }).roles).toEqual(roles);
  });

  it('starts with no memberships while they are still being loaded', () => {
    const values = initialUserForm({ mode: 'edit', entity: user });

    expect(values.roles).toEqual([]);
    expect(values.groups).toEqual([]);
  });
});

describe('nextUserForm', () => {
  const previous = form();

  it('lets the login follow the display name while the user has not touched it', () => {
    const next = { ...previous, displayName: 'Alice B Anderson' };

    expect(nextUserForm(previous, next, { mode: 'create' }).name).toBe('alice.b.anderson');
  });

  it('keeps a typed login exactly as typed, in the same edit that reports it', () => {
    const next = { ...previous, name: 'a' };

    expect(nextUserForm(previous, next, { mode: 'create' })).toEqual({ ...next, nameEdited: true });
  });

  it('stops deriving once the login is the user’s', () => {
    const next = { ...previous, displayName: 'Renamed', nameEdited: true };

    expect(nextUserForm(previous, next, { mode: 'create' }).name).toBe('alice');
  });

  it('never derives while editing, where the field is locked', () => {
    const next = { ...previous, displayName: 'Renamed' };

    expect(nextUserForm(previous, next, { mode: 'edit' }).name).toBe('alice');
  });
});

describe('validateUserForm', () => {
  it('passes a filled form', () => {
    expect(validateUserForm(form(), 'create')).toEqual({});
  });

  it('requires a display name, a login and an email', () => {
    const errors = validateUserForm(form({ displayName: ' ', name: '', email: '' }), 'create');

    expect(errors).toEqual({
      displayName: 'users.dialog.displayNameRequired',
      name: 'users.dialog.idRequired',
      email: 'users.dialog.emailRequired',
      idProvider: undefined,
    });
  });

  // The fields a remote system owns have no step in the dialog, so an error on one could never be fixed.
  it('asks nothing of the fields a remote user cannot edit', () => {
    expect(
      validateUserForm(form({ displayName: ' ', email: '' }), 'edit', { remoteUser: true }),
    ).toEqual({});
    expect(
      validateUserForm(form({ email: 'not-an-address' }), 'edit', { remoteUser: true }),
    ).toEqual({});
  });

  it('refuses a login carrying a character XP rejects', () => {
    expect(validateUserForm(form({ name: 'alice anderson' }), 'create').name).toBe(
      'users.dialog.idInvalid',
    );
  });

  it('refuses an address that is not one', () => {
    expect(validateUserForm(form({ email: 'alice@' }), 'create').email).toBe(
      'users.dialog.emailInvalid',
    );
  });

  it('asks a system user for no email', () => {
    expect(validateUserForm(form({ email: '' }), 'edit', { systemUser: true })).toEqual({});
  });

  it('requires a provider only while creating, because the key carries it', () => {
    expect(validateUserForm(form({ idProvider: '' }), 'create').idProvider).toBe(
      'users.dialog.idProviderRequired',
    );
    expect(validateUserForm(form({ idProvider: '' }), 'edit').idProvider).toBeUndefined();
  });

  it('says nothing about the login while editing, where it is locked', () => {
    expect(validateUserForm(form({ name: '' }), 'edit').name).toBeUndefined();
  });
});

describe('showsPublicKeys', () => {
  it('is true for the system provider and false for any other', () => {
    expect(showsPublicKeys(form({ idProvider: 'system' }))).toBe(true);
    expect(showsPublicKeys(form({ idProvider: 'store' }))).toBe(false);
    expect(showsPublicKeys(form({ idProvider: '' }))).toBe(false);
  });
});

describe('passwordActions', () => {
  it('offers to set a password a user does not have, and nothing to clear', () => {
    expect(passwordActions(false)).toEqual({ action: 'set', clearable: false });
  });

  it('offers to change and to clear one a user has', () => {
    expect(passwordActions(true)).toEqual({ action: 'change', clearable: true });
  });
});

describe('validateUserForm on the password', () => {
  it('says nothing while the field is not on offer', () => {
    expect(validateUserForm(form(), 'create').password).toBeUndefined();
  });

  it('requires one once the field is offered', () => {
    expect(validateUserForm(form({ password: '' }), 'create').password).toBe(
      'users.dialog.passwordRequired',
    );
  });

  it('refuses one below medium', () => {
    expect(validateUserForm(form({ password: 'abcdefg1' }), 'create').password).toBe(
      'users.dialog.passwordTooWeak',
    );
  });

  it('accepts one at medium or above', () => {
    expect(validateUserForm(form({ password: 'Abcdefg1!!' }), 'create').password).toBeUndefined();
    expect(validateUserForm(form({ password: 'Abcdefg1!!!!' }), 'edit').password).toBeUndefined();
  });
});

describe('sameUserForm', () => {
  const admin = { key: 'role:cms.admin', type: 'role', displayName: 'CS Admin' } as PrincipalRef;
  const editors = {
    key: 'group:store:editors',
    type: 'group',
    displayName: 'Editors',
  } as PrincipalRef;

  it('reports an untouched form as unchanged', () => {
    expect(sameUserForm(form(), form())).toBe(true);
  });

  it('sees a renamed and a re-addressed user', () => {
    expect(sameUserForm(form(), form({ displayName: 'Alice A.' }))).toBe(false);
    expect(sameUserForm(form(), form({ email: 'other@example.com' }))).toBe(false);
  });

  it('ignores whitespace the save would trim away', () => {
    expect(sameUserForm(form(), form({ displayName: '  Alice Anderson  ' }))).toBe(true);
  });

  it('sees either membership list move, separately', () => {
    expect(sameUserForm(form(), form({ roles: [admin] }))).toBe(false);
    expect(sameUserForm(form(), form({ groups: [editors] }))).toBe(false);
  });

  it('ignores the order either list is held in', () => {
    const two = [admin, { ...admin, key: 'role:cms.expert' } as PrincipalRef];
    expect(sameUserForm(form({ roles: two }), form({ roles: [...two].reverse() }))).toBe(true);
  });

  it('counts any staged password as a change, even an empty one', () => {
    expect(sameUserForm(form(), form({ password: 'Str0ng!Passw0rd' }))).toBe(false);
    expect(sameUserForm(form(), form({ password: '' }))).toBe(false);
  });

  it('counts a staged key on either side of the save', () => {
    const added = { id: 'a', publicKey: 'PEM' };

    expect(sameUserForm(form(), form({ keyAdditions: [added] }))).toBe(false);
    expect(sameUserForm(form(), form({ keyRemovals: ['kid-1'] }))).toBe(false);
  });
});

describe('validateUserForm password rules', () => {
  it('requires a password once the field has been opened', () => {
    expect(validateUserForm(form({ password: '' }), 'edit').password).toBe(
      'users.dialog.passwordRequired',
    );
  });

  it('refuses a password carrying a space, before judging its strength', () => {
    expect(validateUserForm(form({ password: 'Str0ng! Passw0rd' }), 'edit').password).toBe(
      'users.dialog.passwordSpaces',
    );
  });

  it('refuses a weak password', () => {
    expect(validateUserForm(form({ password: 'aaaa' }), 'edit').password).toBe(
      'users.dialog.passwordTooWeak',
    );
  });

  it('accepts a strong one', () => {
    expect(
      validateUserForm(form({ password: 'Str0ng!Passw0rd' }), 'edit').password,
    ).toBeUndefined();
  });

  it('says nothing about a password the user never opened', () => {
    expect(validateUserForm(form(), 'edit').password).toBeUndefined();
  });
});

describe('USER_FORM_FIELDS', () => {
  it('names every field the validator can complain about', () => {
    const invalid = validateUserForm(
      form({ idProvider: '', name: '', displayName: '', email: '', password: 'x' }),
      'create',
    );

    expect(Object.keys(invalid).length).toBeGreaterThan(0);
    expect(Object.keys(invalid).every((field) => USER_FORM_FIELDS.includes(field as never))).toBe(
      true,
    );
  });
});
