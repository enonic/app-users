import { describe, expect, it } from 'vitest';

import { userDraftFrom } from './user-draft';
import type { UserForm } from './user-form';

const FORM: UserForm = {
  idProvider: 'system',
  name: 'jane',
  displayName: 'Jane Doe',
  email: 'jane@example.com',
  roles: [{ key: 'role:system.admin', displayName: 'Administrator', type: 'role' }],
  groups: [{ key: 'group:system:editors', displayName: 'Editors', type: 'group' }],
  keyAdditions: [],
  keyRemovals: [],
};

describe('userDraftFrom', () => {
  it('flattens the picked principals to their keys', () => {
    const draft = userDraftFrom(FORM);

    expect(draft.roles).toEqual(['role:system.admin']);
    expect(draft.groups).toEqual(['group:system:editors']);
  });

  it('carries the identity fields through untouched', () => {
    const draft = userDraftFrom(FORM);

    expect(draft).toMatchObject({
      idProvider: 'system',
      name: 'jane',
      displayName: 'Jane Doe',
      email: 'jane@example.com',
    });
  });

  it('leaves the password out until one is set', () => {
    expect(userDraftFrom(FORM).password).toBeUndefined();
  });

  it('sends the password the user set', () => {
    expect(userDraftFrom({ ...FORM, password: 'sekret-42!' }).password).toBe('sekret-42!');
  });

  it('drops the wizard-only fields', () => {
    const draft = userDraftFrom({ ...FORM, clearPassword: true });

    expect('clearPassword' in draft).toBe(false);
  });
});
