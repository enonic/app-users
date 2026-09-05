import { afterEach, describe, expect, it } from 'vitest';

import type { User } from '../../../entities/principal';
import { USER_EDITOR_STEPS } from './user-editor-steps';
import {
  $userEditor,
  closeUserEditor,
  openUserEditor,
  openUserEditorAt,
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

    expect(open).toBe(true);
    expect(view).toBe('wizard');
    expect(step).toBe(USER_EDITOR_STEPS.identity);
  });
});

describe('openUserEditorAt', () => {
  it('opens one step of an existing user, with the form seeded from it', () => {
    openUserEditorAt(ALICE, USER_EDITOR_STEPS.roles);

    const { open, mode, view, step, form, saved, user } = $userEditor.get();

    expect({ open, mode, view, step }).toEqual({
      open: true,
      mode: 'edit',
      view: 'step',
      step: USER_EDITOR_STEPS.roles,
    });
    expect(user).toBe(ALICE);
    expect(form.name).toBe('alice');
    // Nothing to save until something changes: the baseline is what the server answered.
    expect(saved).toEqual(form);
  });

  it('leaves the wizard behind it, so the next open walks every step again', () => {
    openUserEditorAt(ALICE, USER_EDITOR_STEPS.groups);
    closeUserEditor();
    openUserEditor({ mode: 'create' });

    expect($userEditor.get().view).toBe('wizard');
  });
});
