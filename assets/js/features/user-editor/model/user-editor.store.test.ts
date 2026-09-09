import { ok } from 'neverthrow';
import { afterEach, describe, expect, it } from 'vitest';

import { receiveIdProviderNames, type User } from '../../../entities/principal';
import {
  $userEditor,
  $userEditorErrors,
  $userEditorProviders,
  $userEditorServiceAccount,
  closeUserEditor,
  openServiceAccountEditor,
  openServiceAccountEditorAt,
  openUserEditor,
  openUserEditorAt,
  updateUserEditorForm,
  userNameCheck,
} from './user-editor.store';

const ALICE: User = {
  type: 'user',
  key: 'user:system:alice' as User['key'],
  displayName: 'Alice',
  login: 'alice',
  email: 'alice@example.com',
  idProvider: 'system',
  hasPassword: true,
};

afterEach(() => {
  closeUserEditor();
});

describe('openUserEditor', () => {
  it('opens the whole wizard at its first step', () => {
    openUserEditor({ mode: 'create' });

    const { open, view, step } = $userEditor.get();

    expect({ open, view, step }).toEqual({ open: true, view: 'wizard', step: 'identity' });
  });

  it('derives the name from the display name until it is typed', () => {
    openUserEditor({ mode: 'create' });
    updateUserEditorForm({ displayName: 'Alice Anderson' });

    expect($userEditor.get().form.name).toBe('alice.anderson');
  });
});

describe('openUserEditorAt', () => {
  it('opens one step of an existing user, with the form seeded from it', () => {
    openUserEditorAt(ALICE, 'roles');

    const { open, mode, view, step, form, saved, entity } = $userEditor.get();

    expect({ open, mode, view, step }).toEqual({
      open: true,
      mode: 'edit',
      view: 'step',
      step: 'roles',
    });
    expect(entity).toBe(ALICE);
    expect(form.name).toBe('alice');
    expect(saved).toEqual(form);
  });
});

describe('$userEditorErrors', () => {
  it('reports a taken name, and only once the local rules accept it', () => {
    openUserEditor({ mode: 'create' });
    updateUserEditorForm({ idProvider: 'system', displayName: 'Alice' });
    userNameCheck.receive('user:system:alice', true);

    expect($userEditorErrors.get().name).toBe('users.dialog.nameTaken');

    updateUserEditorForm({ name: '' });

    expect($userEditorErrors.get().name).toBe('users.dialog.nameRequired');
  });

  it('says nothing about a check that failed', () => {
    openUserEditor({ mode: 'create' });
    updateUserEditorForm({ idProvider: 'system', displayName: 'Alice' });
    userNameCheck.fail('user:system:alice');

    expect($userEditorErrors.get().name).toBeUndefined();
  });
});

describe('openServiceAccountEditor', () => {
  it('starts a create in the system store, and says the Service Accounts section opened it', () => {
    receiveIdProviderNames(ok([{ key: 'ldap', displayName: 'Corporate LDAP' }]));

    openServiceAccountEditor({ mode: 'create' });

    expect($userEditorServiceAccount.get()).toBe(true);
    expect($userEditor.get().form.idProvider).toBe('system');
  });

  it('hands the dialog back to the Users section on its next open', () => {
    openServiceAccountEditorAt(ALICE, 'roles');

    expect($userEditorServiceAccount.get()).toBe(true);

    closeUserEditor();
    openUserEditor({ mode: 'create' });

    expect($userEditorServiceAccount.get()).toBe(false);
  });
});

describe('$userEditorProviders', () => {
  it('leaves the system store out, and defaults the form to the one provider left', () => {
    receiveIdProviderNames(
      ok([
        { key: 'system', displayName: 'System' },
        { key: 'ldap', displayName: 'Corporate LDAP' },
      ]),
    );

    expect($userEditorProviders.get().map(({ key }) => key)).toEqual(['ldap']);

    openUserEditor({ mode: 'create' });

    expect($userEditor.get().form.idProvider).toBe('ldap');
  });
});
