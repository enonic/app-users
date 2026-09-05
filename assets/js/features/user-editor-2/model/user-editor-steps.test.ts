import { describe, expect, it } from 'vitest';

import { USER_EDITOR_STEPS } from './user-editor-steps';
import { USER_FORM_FIELDS } from './user-form';

describe('USER_EDITOR_STEPS', () => {
  it('claims each form field exactly once', () => {
    expect([...USER_EDITOR_STEPS.allFields].sort()).toEqual([...USER_FORM_FIELDS].sort());
  });
});
