import { afterEach, describe, expect, it } from 'vitest';

import type { Role } from '../../../entities/principal';
import {
  $roleEditor,
  $roleEditorErrors,
  closeRoleEditor,
  openRoleEditor,
  openRoleEditorAt,
  roleNameCheck,
  seedRoleEditorMembers,
  updateRoleEditorForm,
} from './role-editor.store';

const MANAGER: Role = {
  type: 'role',
  key: 'role:store.manager',
  displayName: 'Store Manager',
  description: 'Runs the shop',
};

afterEach(() => {
  closeRoleEditor();
});

describe('openRoleEditor', () => {
  it('opens the whole wizard at its first step', () => {
    openRoleEditor({ mode: 'create' });

    const { open, view, step } = $roleEditor.get();

    expect({ open, view, step }).toEqual({ open: true, view: 'wizard', step: 'general' });
  });

  it('derives the name from the display name until it is typed', () => {
    openRoleEditor({ mode: 'create' });
    updateRoleEditorForm({ displayName: 'Store Manager' });

    expect($roleEditor.get().form.name).toBe('store.manager');
  });
});

describe('openRoleEditorAt', () => {
  it('opens one step of an existing role, with the form seeded from it', () => {
    openRoleEditorAt(MANAGER, 'members');

    const { open, mode, view, step, form, saved, entity } = $roleEditor.get();

    expect({ open, mode, view, step }).toEqual({
      open: true,
      mode: 'edit',
      view: 'step',
      step: 'members',
    });
    expect(entity).toBe(MANAGER);
    expect(form).toMatchObject({ name: 'store.manager', description: 'Runs the shop' });
    expect(saved).toEqual(form);
  });
});

describe('seedRoleEditorMembers', () => {
  const ALICE = { key: 'user:store:alice', displayName: 'Alice', type: 'user' } as const;
  const BOB = { key: 'user:store:bob', displayName: 'Bob', type: 'user' } as const;

  it('lands in the baseline, and keeps what was picked while the read was in flight', () => {
    openRoleEditor({ mode: 'edit', entity: MANAGER });
    updateRoleEditorForm({ members: [BOB] });
    seedRoleEditorMembers([ALICE]);

    const { form, saved } = $roleEditor.get();

    expect(form.members).toEqual([ALICE, BOB]);
    expect(saved.members).toEqual([ALICE]);
  });
});

describe('$roleEditorErrors', () => {
  it('reports a taken name, and only once the local rules accept it', () => {
    openRoleEditor({ mode: 'create' });
    updateRoleEditorForm({ displayName: 'Store Manager' });
    roleNameCheck.receive('role:store.manager', true);

    expect($roleEditorErrors.get().name).toBe('roles.dialog.nameTaken');

    updateRoleEditorForm({ name: '' });

    expect($roleEditorErrors.get().name).toBe('roles.dialog.nameRequired');
  });

  it('says nothing about a check that failed', () => {
    openRoleEditor({ mode: 'create' });
    updateRoleEditorForm({ displayName: 'Store Manager' });
    roleNameCheck.fail('role:store.manager');

    expect($roleEditorErrors.get().name).toBeUndefined();
  });
});
