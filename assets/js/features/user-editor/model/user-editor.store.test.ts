import { ok, okAsync } from 'neverthrow';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { receiveIdProviderNames, type User } from '../../../entities/principal';
import { requestUserEmailHolder } from '../../../entities/principal/api/users.api';
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
  setUserEditorEmail,
  setUserEditorIdProvider,
  updateUserEditorForm,
  userEmailCheck,
  userNameCheck,
} from './user-editor.store';

// Only the email question reaches the wire from here; everything else in the module stays real.
vi.mock('../../../entities/principal/api/users.api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../entities/principal/api/users.api')>()),
  requestUserEmailHolder: vi.fn(),
}));

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

    expect({ open, view, step }).toEqual({ open: true, view: 'wizard', step: 'general' });
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

  it('reports an email another user of the provider holds', () => {
    openUserEditor({ mode: 'create' });
    updateUserEditorForm({ idProvider: 'system', email: 'alice@example.com' });
    userEmailCheck.receive('email:system|alice@example.com', true);

    expect($userEditorErrors.get().email).toBe('users.dialog.emailTaken');
  });

  it('words a clash for the section that opened the dialog', () => {
    openServiceAccountEditor({ mode: 'create' });
    updateUserEditorForm({ displayName: 'Deploy bot', email: 'bot@example.com' });
    userNameCheck.receive('user:system:deploy.bot', true);
    userEmailCheck.receive('email:system|bot@example.com', true);

    expect($userEditorErrors.get()).toMatchObject({
      name: 'serviceAccounts.dialog.nameTaken',
      email: 'serviceAccounts.dialog.emailTaken',
    });
  });
});

describe('setUserEditorEmail', () => {
  const holder = vi.mocked(requestUserEmailHolder);

  beforeEach(() => {
    vi.useFakeTimers();
    holder.mockReset();
    holder.mockReturnValue(okAsync(undefined));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('asks the provider once the address settles, holding the later steps meanwhile', async () => {
    openUserEditor({ mode: 'create' });
    updateUserEditorForm({ idProvider: 'ldap' });

    setUserEditorEmail('alice@example.com');

    expect(userEmailCheck.$state.get()).toEqual({
      status: 'pending',
      key: 'email:ldap|alice@example.com',
    });

    await vi.runAllTimersAsync();

    expect(holder).toHaveBeenCalledWith('ldap', 'alice@example.com', expect.any(AbortSignal));
    expect(userEmailCheck.$state.get().status).toBe('available');
  });

  it('asks in an edit too, and leaves the user its own address', async () => {
    holder.mockReturnValue(okAsync(ALICE.key));
    openUserEditorAt(ALICE, 'general');

    setUserEditorEmail('Alice@Example.com', { immediate: true });
    await vi.runAllTimersAsync();

    expect(userEmailCheck.$state.get()).toEqual({
      status: 'available',
      key: 'email:system|alice@example.com',
    });
  });

  it('asks nothing for su and anonymous, which have no email', () => {
    openUserEditorAt({ ...ALICE, key: 'user:system:su' as User['key'], login: 'su' }, 'general');

    setUserEditorEmail('su@example.com', { immediate: true });

    expect(userEmailCheck.$state.get()).toEqual({ status: 'idle' });
    expect(holder).not.toHaveBeenCalled();
  });

  it('asks the new provider about an address already typed', async () => {
    openUserEditor({ mode: 'create' });
    updateUserEditorForm({ idProvider: 'ldap' });
    setUserEditorEmail('alice@example.com', { immediate: true });
    await vi.runAllTimersAsync();

    setUserEditorIdProvider('system');
    await vi.runAllTimersAsync();

    expect(holder.mock.calls.map(([provider]) => provider)).toEqual(['ldap', 'system']);
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
