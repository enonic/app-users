import { describe, expect, it } from 'vitest';

import { ROLE_EDITOR_STEPS } from './role-editor-steps';
import { ROLE_FORM_FIELDS } from './role-form';

describe('ROLE_EDITOR_STEPS', () => {
  it('claims each form field exactly once', () => {
    expect([...ROLE_EDITOR_STEPS.allFields].sort()).toEqual([...ROLE_FORM_FIELDS].sort());
  });
});
