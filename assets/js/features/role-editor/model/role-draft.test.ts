import { describe, expect, it } from 'vitest';

import { roleDraftFrom } from './role-draft';
import type { RoleForm } from './role-form';

const FORM: RoleForm = {
  name: 'store.manager',
  displayName: 'Store Manager',
  description: 'Runs the shop',
  members: [{ key: 'user:store:alice', displayName: 'Alice', type: 'user' }],
};

describe('roleDraftFrom', () => {
  it('flattens the picked members to their keys', () => {
    expect(roleDraftFrom(FORM).members).toEqual(['user:store:alice']);
  });

  it('carries the identity fields through untouched', () => {
    expect(roleDraftFrom(FORM)).toMatchObject({
      name: 'store.manager',
      displayName: 'Store Manager',
      description: 'Runs the shop',
    });
  });

  it('drops the wizard-only field', () => {
    expect('nameEdited' in roleDraftFrom({ ...FORM, nameEdited: true })).toBe(false);
  });
});
