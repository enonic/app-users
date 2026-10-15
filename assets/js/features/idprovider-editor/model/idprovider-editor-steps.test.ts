import { describe, expect, it } from 'vitest';

import { ID_PROVIDER_EDITOR_STEPS } from './idprovider-editor-steps';
import { ID_PROVIDER_FORM_FIELDS } from './idprovider-form';

describe('ID_PROVIDER_EDITOR_STEPS', () => {
  it('claims each form field exactly once', () => {
    expect([...ID_PROVIDER_EDITOR_STEPS.allFields].sort()).toEqual(
      [...ID_PROVIDER_FORM_FIELDS].sort(),
    );
  });
});
