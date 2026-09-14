import { describe, expect, it } from 'vitest';

import { defineSteps } from './steps';

type Field = 'name' | 'email' | 'password' | 'unused';

const STEPS = defineSteps<'general' | 'credentials' | 'members' | 'summary', Field>({
  general: { title: 'dialog.general', fields: ['name', 'email'] },
  credentials: { title: 'dialog.credentials', fields: ['password'] },
  members: { title: 'dialog.members', fields: [] },
  summary: { title: 'dialog.summary', fields: [] },
});

describe('defineSteps', () => {
  it('keeps the table order and names each step after its key', () => {
    expect(STEPS.order).toEqual(['general', 'credentials', 'members', 'summary']);
    expect(STEPS.ids).toEqual({
      general: 'general',
      credentials: 'credentials',
      members: 'members',
      summary: 'summary',
    });
  });

  it('indexes titles and fields by step', () => {
    expect(STEPS.titles.credentials).toBe('dialog.credentials');
    expect(STEPS.fields.general).toEqual(['name', 'email']);
    expect(STEPS.allFields).toEqual(['name', 'email', 'password']);
  });
});

describe('locked', () => {
  it('leaves every step open while the form is answered', () => {
    const locks = STEPS.locked({});

    expect(STEPS.order.filter((step) => locks[step])).toEqual([]);
  });

  it('locks the steps behind an unanswered one, and never the step itself', () => {
    const locks = STEPS.locked({ name: 'dialog.nameRequired' });

    expect(locks.general).toBe(false);
    expect(locks.credentials).toBe(true);
    expect(locks.summary).toBe(true);
  });

  it('locks from the erroring step onwards, wherever it sits', () => {
    const locks = STEPS.locked({ password: 'dialog.passwordTooWeak' });

    expect(locks.general).toBe(false);
    expect(locks.credentials).toBe(false);
    expect(locks.members).toBe(true);
    expect(locks.summary).toBe(true);
  });

  it('holds the later steps back while a field is still being checked', () => {
    const locks = STEPS.locked({}, ['name']);

    expect(locks.general).toBe(false);
    expect(locks.credentials).toBe(true);
    expect(locks.summary).toBe(true);
  });

  it('ignores an error on a field no step claims', () => {
    const locks = STEPS.locked({ unused: 'dialog.unused' });

    expect(STEPS.order.filter((step) => locks[step])).toEqual([]);
  });
});

describe('firstWithError', () => {
  it('finds nothing while the form is answered', () => {
    expect(STEPS.firstWithError({})).toBeUndefined();
  });

  it('names the earliest erroring step, not the earliest locked one', () => {
    const step = STEPS.firstWithError({
      email: 'dialog.emailRequired',
      password: 'dialog.passwordTooWeak',
    });

    expect(step).toBe('general');
  });

  it('reaches past the steps that claim no field', () => {
    expect(STEPS.firstWithError({ password: 'dialog.passwordTooWeak' })).toBe('credentials');
  });
});
