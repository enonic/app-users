import { describe, expect, it } from 'vitest';

import { userEditFrom } from './user-edit';
import type { UserForm } from './user-form';

const ADMIN = { key: 'role:system.admin', displayName: 'Administrator', type: 'role' } as const;
const AUTHOR = { key: 'role:cms.author', displayName: 'Author', type: 'role' } as const;
const EDITORS = { key: 'group:system:editors', displayName: 'Editors', type: 'group' } as const;

const SAVED: UserForm = {
  idProvider: 'system',
  name: 'jane',
  displayName: 'Jane Doe',
  email: 'jane@example.com',
  roles: [ADMIN],
  groups: [EDITORS],
  keyAdditions: [],
  keyRemovals: [],
};

describe('userEditFrom', () => {
  it('sends nothing to move while the lists are untouched', () => {
    const edit = userEditFrom(SAVED, SAVED);

    expect(edit).toMatchObject({
      addRoles: [],
      removeRoles: [],
      addGroups: [],
      removeGroups: [],
    });
  });

  it('names what moved rather than the lists themselves', () => {
    const edit = userEditFrom({ ...SAVED, roles: [AUTHOR], groups: [] }, SAVED);

    expect(edit.addRoles).toEqual(['role:cms.author']);
    expect(edit.removeRoles).toEqual(['role:system.admin']);
    expect(edit.removeGroups).toEqual(['group:system:editors']);
  });

  it('leaves the password alone while none was typed', () => {
    expect(userEditFrom(SAVED, SAVED).password).toBeUndefined();
  });

  it('sends the typed password', () => {
    expect(userEditFrom({ ...SAVED, password: 'sekret-42!' }, SAVED).password).toBe('sekret-42!');
  });

  it('clears the password with the empty string', () => {
    expect(userEditFrom({ ...SAVED, clearPassword: true }, SAVED).password).toBe('');
  });

  it('carries no staged key material', () => {
    const edit = userEditFrom(
      { ...SAVED, keyAdditions: [{ id: 'a', publicKey: 'pem', privateKey: 'sekret-42!' }] },
      SAVED,
    );

    expect(JSON.stringify(edit)).not.toContain('sekret-42!');
  });
});
