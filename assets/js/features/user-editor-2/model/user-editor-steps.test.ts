import { describe, expect, it } from 'vitest';

import {
  firstUserEditorStepWithError,
  lockedUserEditorSteps,
  USER_EDITOR_STEP_FIELDS,
  USER_EDITOR_STEP_ORDER,
  USER_EDITOR_STEP_TITLES,
  USER_EDITOR_STEPS,
} from './user-editor-steps';
import { USER_FORM_FIELDS } from './user-form';

describe('USER_EDITOR_STEP_FIELDS', () => {
  it('claims each form field at most once', () => {
    const claimed = USER_EDITOR_STEP_ORDER.flatMap((step) => USER_EDITOR_STEP_FIELDS[step]);

    expect(claimed).toEqual([...new Set(claimed)]);
  });

  it('claims nothing the form does not have', () => {
    const claimed = USER_EDITOR_STEP_ORDER.flatMap((step) => USER_EDITOR_STEP_FIELDS[step]);

    expect(claimed.filter((field) => !USER_FORM_FIELDS.includes(field))).toEqual([]);
  });
});

describe('lockedUserEditorSteps', () => {
  it('leaves every step open while the form is answered', () => {
    const locks = lockedUserEditorSteps({});

    expect(USER_EDITOR_STEP_ORDER.filter((step) => locks[step])).toEqual([]);
  });

  it('locks the steps behind an unanswered one, and never the step itself', () => {
    const locks = lockedUserEditorSteps({ name: 'users.dialog.nameRequired' });

    expect(locks[USER_EDITOR_STEPS.identity]).toBe(false);
    expect(locks[USER_EDITOR_STEPS.credentials]).toBe(true);
    expect(locks[USER_EDITOR_STEPS.summary]).toBe(true);
  });

  it('locks from the erroring step onwards, wherever it sits', () => {
    const locks = lockedUserEditorSteps({ password: 'users.dialog.passwordTooWeak' });

    expect(locks[USER_EDITOR_STEPS.identity]).toBe(false);
    expect(locks[USER_EDITOR_STEPS.credentials]).toBe(false);
    expect(locks[USER_EDITOR_STEPS.roles]).toBe(true);
    expect(locks[USER_EDITOR_STEPS.groups]).toBe(true);
    expect(locks[USER_EDITOR_STEPS.summary]).toBe(true);
  });

  it('holds the later steps back while a field is still being checked', () => {
    const locks = lockedUserEditorSteps({}, ['name']);

    expect(locks[USER_EDITOR_STEPS.identity]).toBe(false);
    expect(locks[USER_EDITOR_STEPS.credentials]).toBe(true);
    expect(locks[USER_EDITOR_STEPS.summary]).toBe(true);
  });
});

describe('firstUserEditorStepWithError', () => {
  it('finds nothing while the form is answered', () => {
    expect(firstUserEditorStepWithError({})).toBeUndefined();
  });

  it('names the earliest erroring step, not the earliest locked one', () => {
    const step = firstUserEditorStepWithError({
      email: 'users.dialog.emailRequired',
      password: 'users.dialog.passwordTooWeak',
    });

    expect(step).toBe(USER_EDITOR_STEPS.identity);
  });

  it('reaches past the steps that claim no field', () => {
    expect(firstUserEditorStepWithError({ password: 'users.dialog.passwordTooWeak' })).toBe(
      USER_EDITOR_STEPS.credentials,
    );
  });
});

describe('USER_EDITOR_STEP_TITLES', () => {
  it('titles every step the wizard can land on', () => {
    expect(USER_EDITOR_STEP_ORDER.every((step) => USER_EDITOR_STEP_TITLES[step].length > 0)).toBe(
      true,
    );
  });
});
