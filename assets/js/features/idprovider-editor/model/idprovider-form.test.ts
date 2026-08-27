import { describe, expect, it } from 'vitest';

import type { IdProvider, IdProviderPermission, PrincipalRef } from '../../../entities/principal';
import {
  initialIdProviderForm,
  isSystemIdProvider,
  nextIdProviderForm,
  pinnedPermissions,
  sameIdProviderForm,
  validateIdProviderForm,
  withPermissionAccess,
  withPermissionPrincipals,
  type IdProviderForm,
} from './idprovider-form';

const provider: IdProvider = {
  key: 'ldap',
  displayName: 'Company directory',
  description: 'Everyone on staff',
  application: { key: 'com.example.ldap', displayName: 'LDAP login' },
  users: { total: 12 },
  groups: { total: 3 },
};

function form(overrides: Partial<IdProviderForm> = {}): IdProviderForm {
  return {
    name: 'ldap',
    displayName: 'Company directory',
    description: '',
    application: 'com.example.ldap',
    permissions: [{ principal: admins, access: 'ADMINISTRATOR' }],
    ...overrides,
  };
}

const admins: PrincipalRef = {
  type: 'role',
  key: 'role:system.admin',
  displayName: 'Administrator',
};

const editors: PrincipalRef = {
  type: 'group',
  key: 'group:system:editors',
  displayName: 'Editors',
};

describe('initialIdProviderForm', () => {
  it('starts empty for a new provider', () => {
    expect(initialIdProviderForm({ mode: 'create' })).toEqual({
      name: '',
      displayName: '',
      description: '',
      application: '',
      permissions: [],
    });
  });

  it('takes the name from the key, which is the provider id itself', () => {
    expect(initialIdProviderForm({ mode: 'edit', provider }).name).toBe('ldap');
  });

  it('takes the bound application by key, not by name', () => {
    expect(initialIdProviderForm({ mode: 'edit', provider }).application).toBe('com.example.ldap');
  });

  it('reads an unbound provider as bound to nothing', () => {
    const unbound = initialIdProviderForm({
      mode: 'edit',
      provider: { ...provider, application: undefined },
    });

    expect(unbound.application).toBe('');
  });
});

describe('nextIdProviderForm', () => {
  const previous = form();

  it('lets the name follow the display name while the user has not touched it', () => {
    const next = { ...previous, displayName: 'Company Directory EU' };

    expect(nextIdProviderForm(previous, next, 'create', false).values.name).toBe(
      'company.directory.eu',
    );
  });

  it('keeps a typed name exactly as typed, in the same edit that reports it', () => {
    const next = { ...previous, name: 'l' };

    expect(nextIdProviderForm(previous, next, 'create', false)).toEqual({
      values: next,
      nameEdited: true,
    });
  });

  it('never derives while editing, where the field is locked', () => {
    const next = { ...previous, displayName: 'Renamed' };

    expect(nextIdProviderForm(previous, next, 'edit', false).values.name).toBe('ldap');
  });
});

describe('validateIdProviderForm', () => {
  it('passes a filled form', () => {
    expect(validateIdProviderForm(form(), 'create')).toEqual({});
  });

  it('requires a display name', () => {
    expect(validateIdProviderForm(form({ displayName: ' ' }), 'create').displayName).toBe(
      'idProviders.dialog.displayNameRequired',
    );
  });

  it('requires a name while creating', () => {
    expect(validateIdProviderForm(form({ name: '' }), 'create').name).toBe(
      'idProviders.dialog.nameRequired',
    );
  });

  it('refuses a name carrying a character XP rejects', () => {
    expect(validateIdProviderForm(form({ name: 'company directory' }), 'create').name).toBe(
      'idProviders.dialog.nameInvalid',
    );
  });

  it('says nothing about the name while editing, where it is locked', () => {
    expect(validateIdProviderForm(form({ name: '' }), 'edit').name).toBeUndefined();
  });

  it('asks for no application: a provider serving no login is legitimate', () => {
    expect(validateIdProviderForm(form({ application: '' }), 'create')).toEqual({});
  });

  it('refuses a provider nobody may reach', () => {
    expect(validateIdProviderForm(form({ permissions: [] }), 'edit').permissions).toBe(
      'idProviders.dialog.permissionsRequired',
    );
  });
});

describe('isSystemIdProvider', () => {
  it('recognises the provider the platform owns', () => {
    expect(isSystemIdProvider('system')).toBe(true);
  });

  it('leaves every other provider alone', () => {
    expect(isSystemIdProvider('ldap')).toBe(false);
  });
});

describe('withPermissionPrincipals', () => {
  it('grants a newly picked principal what app-users grants it', () => {
    expect(withPermissionPrincipals([], [admins])).toEqual([
      { principal: admins, access: 'CREATE_USERS' },
    ]);
  });

  it('keeps the access of a principal that was already there', () => {
    const current: IdProviderPermission[] = [{ principal: admins, access: 'ADMINISTRATOR' }];

    expect(withPermissionPrincipals(current, [admins, editors])).toEqual([
      { principal: admins, access: 'ADMINISTRATOR' },
      { principal: editors, access: 'CREATE_USERS' },
    ]);
  });

  it('drops an entry the picker no longer carries', () => {
    const current: IdProviderPermission[] = [
      { principal: admins, access: 'READ' },
      { principal: editors, access: 'READ' },
    ];

    expect(withPermissionPrincipals(current, [editors])).toEqual([
      { principal: editors, access: 'READ' },
    ]);
  });

  it('follows the order the picker hands over', () => {
    const current: IdProviderPermission[] = [
      { principal: admins, access: 'READ' },
      { principal: editors, access: 'READ' },
    ];

    expect(
      withPermissionPrincipals(current, [editors, admins]).map(({ principal }) => principal.key),
    ).toEqual(['group:system:editors', 'role:system.admin']);
  });
});

describe('pinnedPermissions', () => {
  const defaults = new Set(['role:system.admin', 'role:system.authenticated']);

  it('pins a seeded entry the list carries', () => {
    const current: IdProviderPermission[] = [
      { principal: admins, access: 'ADMINISTRATOR' },
      { principal: editors, access: 'READ' },
    ];

    expect([...pinnedPermissions(current, defaults)]).toEqual(['role:system.admin']);
  });

  it('pins nothing for a seeded principal the provider does not carry, which stays addable', () => {
    const current: IdProviderPermission[] = [{ principal: editors, access: 'READ' }];

    expect(pinnedPermissions(current, defaults).size).toBe(0);
  });

  it('pins nothing while the defaults have not arrived', () => {
    const current: IdProviderPermission[] = [{ principal: admins, access: 'ADMINISTRATOR' }];

    expect(pinnedPermissions(current, new Set()).size).toBe(0);
  });
});

describe('withPermissionAccess', () => {
  it('changes one entry and leaves the rest alone', () => {
    const current: IdProviderPermission[] = [
      { principal: admins, access: 'READ' },
      { principal: editors, access: 'READ' },
    ];

    expect(withPermissionAccess(current, 'role:system.admin', 'ADMINISTRATOR')).toEqual([
      { principal: admins, access: 'ADMINISTRATOR' },
      { principal: editors, access: 'READ' },
    ]);
  });

  it('ignores a key the list does not carry', () => {
    const current: IdProviderPermission[] = [{ principal: admins, access: 'READ' }];

    expect(withPermissionAccess(current, 'user:system:su', 'ADMINISTRATOR')).toEqual(current);
  });
});

describe('sameIdProviderForm', () => {
  it('reports a form nobody has touched as unchanged', () => {
    expect(sameIdProviderForm(form(), form())).toBe(true);
  });

  it('ignores the whitespace the command trims off anyway', () => {
    expect(sameIdProviderForm(form(), form({ displayName: '  Company directory  ' }))).toBe(true);
  });

  it('sees the binding change, including one removed', () => {
    expect(sameIdProviderForm(form(), form({ application: 'com.example.oidc' }))).toBe(false);
    expect(sameIdProviderForm(form(), form({ application: '' }))).toBe(false);
  });

  it('sees a principal added and a principal removed', () => {
    expect(
      sameIdProviderForm(
        form(),
        form({
          permissions: [
            { principal: admins, access: 'ADMINISTRATOR' },
            { principal: editors, access: 'READ' },
          ],
        }),
      ),
    ).toBe(false);
    expect(sameIdProviderForm(form(), form({ permissions: [] }))).toBe(false);
  });

  // The edit that moves no entry: narrowing somebody who is already on the list.
  it('sees an access level narrowed', () => {
    expect(
      sameIdProviderForm(form(), form({ permissions: [{ principal: admins, access: 'READ' }] })),
    ).toBe(false);
  });

  it('ignores the order the permissions happen to be in', () => {
    const saved = form({
      permissions: [
        { principal: admins, access: 'ADMINISTRATOR' },
        { principal: editors, access: 'READ' },
      ],
    });
    const edited = form({
      permissions: [
        { principal: editors, access: 'READ' },
        { principal: admins, access: 'ADMINISTRATOR' },
      ],
    });

    expect(sameIdProviderForm(saved, edited)).toBe(true);
  });
});
