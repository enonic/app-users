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
  openIdProviderEditor,
  openIdProviderEditorAt,
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
