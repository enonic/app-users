import { describe, expect, it } from 'vitest';

import { GROUP_EDITOR_STEPS } from './group-editor-steps';
import { GROUP_FORM_FIELDS } from './group-form';

describe('GROUP_EDITOR_STEPS', () => {
  it('claims each form field exactly once', () => {
    expect([...GROUP_EDITOR_STEPS.allFields].sort()).toEqual([...GROUP_FORM_FIELDS].sort());
  });
});
