import { afterEach, describe, expect, it } from 'vitest';

import {
  failPrincipalNameCheck,
  receivePrincipalNameCheck,
  type IdProvider,
} from '../../../entities/principal';
import {
  $idProviderEditor,
  $idProviderEditorErrors,
  closeIdProviderEditor,
  idProviderEditorDialog,
  openIdProviderEditor,
  openIdProviderEditorAt,
  seedIdProviderEditorPermissions,
  updateIdProviderEditorForm,
} from './idprovider-editor.store';

const LDAP: IdProvider = {
  key: 'ldap',
  displayName: 'Company directory',
  description: 'Everyone on staff',
  application: { key: 'com.example.ldap', displayName: 'LDAP login' },
  users: { total: 12 },
  groups: { total: 3 },
};

afterEach(() => {
  closeIdProviderEditor();
});

describe('openIdProviderEditor', () => {
  it('opens the whole wizard at its first step', () => {
    openIdProviderEditor({ mode: 'create' });

    const { open, view, step } = $idProviderEditor.get();

    expect({ open, view, step }).toEqual({ open: true, view: 'wizard', step: 'identity' });
  });

  it('derives the name from the display name until it is typed', () => {
    openIdProviderEditor({ mode: 'create' });
    updateIdProviderEditorForm({ displayName: 'Company directory' });

    expect($idProviderEditor.get().form.name).toBe('company.directory');
  });
});

describe('openIdProviderEditorAt', () => {
  it('opens one step of an existing provider, with the form seeded from it', () => {
    openIdProviderEditorAt(LDAP, 'permissions');

    const { open, mode, view, step, form, saved, entity } = $idProviderEditor.get();

    expect({ open, mode, view, step }).toEqual({
      open: true,
      mode: 'edit',
      view: 'step',
      step: 'permissions',
    });
    expect(entity).toBe(LDAP);
    expect(form).toMatchObject({ name: 'ldap', application: 'com.example.ldap' });
    expect(saved).toEqual(form);
  });
});

describe('seedIdProviderEditorPermissions', () => {
  const ADMINS = {
    principal: { key: 'role:system.admin', displayName: 'Administrator', type: 'role' },
    access: 'ADMINISTRATOR',
  } as const;
  const EDITORS = {
    principal: { key: 'group:system:editors', displayName: 'Editors', type: 'group' },
    access: 'READ',
  } as const;

  it('lands in the baseline, and keeps what was picked while the read was in flight', () => {
    openIdProviderEditor({ mode: 'edit', entity: LDAP });
    updateIdProviderEditorForm({ permissions: [EDITORS] });
    seedIdProviderEditorPermissions([ADMINS]);

    const { form, saved } = $idProviderEditor.get();

    expect(form.permissions).toEqual([ADMINS, EDITORS]);
    expect(saved.permissions).toEqual([ADMINS]);
  });

  it('starts a new provider from the defaults without making it dirty', () => {
    openIdProviderEditor({ mode: 'create' });
    seedIdProviderEditorPermissions([ADMINS]);

    expect($idProviderEditor.get().form.permissions).toEqual([ADMINS]);
    expect(idProviderEditorDialog.$dirty.get()).toBe(false);
  });
});

describe('$idProviderEditorErrors', () => {
  it('reports a taken name, and only once the local rules accept it', () => {
    openIdProviderEditor({ mode: 'create' });
    updateIdProviderEditorForm({ displayName: 'Company directory' });
    receivePrincipalNameCheck('company.directory', true);

    expect($idProviderEditorErrors.get().name).toBe('idProviders.dialog.nameTaken');

    updateIdProviderEditorForm({ name: '' });

    expect($idProviderEditorErrors.get().name).toBe('idProviders.dialog.nameRequired');
  });

  it('says nothing about a check that failed', () => {
    openIdProviderEditor({ mode: 'create' });
    updateIdProviderEditorForm({ displayName: 'Company directory' });
    failPrincipalNameCheck('company.directory');

    expect($idProviderEditorErrors.get().name).toBeUndefined();
  });
});
