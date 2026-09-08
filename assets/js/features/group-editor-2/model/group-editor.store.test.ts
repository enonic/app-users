import { ok } from 'neverthrow';
import { afterEach, describe, expect, it } from 'vitest';

import {
  failPrincipalNameCheck,
  receiveIdProviderNames,
  receivePrincipalNameCheck,
  type Group,
} from '../../../entities/principal';
import {
  $groupEditor,
  $groupEditorErrors,
  closeGroupEditor,
  openGroupEditor,
  openGroupEditorAt,
  updateGroupEditorForm,
} from './group-editor.store';

const MANAGERS: Group = {
  type: 'group',
  key: 'group:store:managers',
  displayName: 'Managers',
  description: 'Runs the shops',
};

afterEach(() => {
  closeGroupEditor();
});

describe('openGroupEditor', () => {
  it('opens the whole wizard at its first step', () => {
    openGroupEditor({ mode: 'create' });

    const { open, view, step } = $groupEditor.get();

    expect({ open, view, step }).toEqual({ open: true, view: 'wizard', step: 'identity' });
  });

  it('derives the name from the display name until it is typed', () => {
    openGroupEditor({ mode: 'create' });
    updateGroupEditorForm({ displayName: 'Store Managers' });

    expect($groupEditor.get().form.name).toBe('store.managers');
  });
});

describe('openGroupEditorAt', () => {
  it('opens one step of an existing group, with the form seeded from it', () => {
    openGroupEditorAt(MANAGERS, 'members');

    const { open, mode, view, step, form, saved, entity } = $groupEditor.get();

    expect({ open, mode, view, step }).toEqual({
      open: true,
      mode: 'edit',
      view: 'step',
      step: 'members',
    });
    expect(entity).toBe(MANAGERS);
    expect(form).toMatchObject({
      idProvider: 'store',
      name: 'managers',
      description: 'Runs the shops',
    });
    expect(saved).toEqual(form);
  });
});

describe('$groupEditorErrors', () => {
  it('reports a taken name, and only once the local rules accept it', () => {
    openGroupEditor({ mode: 'create' });
    updateGroupEditorForm({ idProvider: 'store', displayName: 'Managers' });
    receivePrincipalNameCheck('group:store:managers', true);

    expect($groupEditorErrors.get().name).toBe('groups.dialog.nameTaken');

    updateGroupEditorForm({ name: '' });

    expect($groupEditorErrors.get().name).toBe('groups.dialog.nameRequired');
  });

  it('says nothing about a check that failed', () => {
    openGroupEditor({ mode: 'create' });
    updateGroupEditorForm({ idProvider: 'store', displayName: 'Managers' });
    failPrincipalNameCheck('group:store:managers');

    expect($groupEditorErrors.get().name).toBeUndefined();
  });
});

describe('the provider a create starts on', () => {
  afterEach(() => {
    receiveIdProviderNames(ok([]));
  });

  it('is the only one there is', () => {
    receiveIdProviderNames(ok([{ key: 'store', displayName: 'Store' }]));

    openGroupEditor({ mode: 'create' });

    expect($groupEditor.get().form.idProvider).toBe('store');
  });

  // The system store is offered too: `group:system:administrators` is a group like any other.
  it('is none while there are several to choose from', () => {
    receiveIdProviderNames(
      ok([
        { key: 'system', displayName: 'System' },
        { key: 'store', displayName: 'Store' },
      ]),
    );

    openGroupEditor({ mode: 'create' });

    expect($groupEditor.get().form.idProvider).toBe('');
  });
});
