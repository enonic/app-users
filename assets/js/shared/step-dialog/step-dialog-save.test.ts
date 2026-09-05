import { errAsync, okAsync } from 'neverthrow';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '../api';
import { runStepDialogSave, type StepDialogSaveOptions } from './step-dialog-save';
import { createStepDialogStore } from './step-dialog.store';
import { defineSteps } from './steps';

type Field = 'name' | 'displayName';
type Form = { name: string; displayName: string };
type Entity = { key: string; displayName: string };

const STEPS = defineSteps<'identity' | 'summary', Field>({
  identity: { title: 'dialog.identity', fields: ['name', 'displayName'] },
  summary: { title: 'dialog.summary', fields: [] },
});

const ALICE: Entity = { key: 'alice', displayName: 'Alice' };

const store = createStepDialogStore<'identity' | 'summary', Field, Form, Entity>({
  steps: STEPS,
  initialForm: (payload) =>
    payload.mode === 'create'
      ? { name: '', displayName: '' }
      : { name: payload.entity.key, displayName: payload.entity.displayName },
  validate: (form) => (form.displayName.length === 0 ? { displayName: 'dialog.required' } : {}),
  same: (saved, edited) => saved.displayName === edited.displayName,
});

const NOTICES = {
  created: 'notify.created',
  updated: 'notify.updated',
  createFailed: 'notify.createFailed',
  updateFailed: 'notify.updateFailed',
};

function options(
  overrides: Partial<StepDialogSaveOptions<Form, Entity, Entity>> = {},
): StepDialogSaveOptions<Form, Entity, Entity> {
  return {
    write: (form) => okAsync({ key: form.name, displayName: form.displayName }),
    notices: NOTICES,
    notify: vi.fn(),
    onSaved: vi.fn(),
    ...overrides,
  };
}

afterEach(() => {
  store.close();
  vi.restoreAllMocks();
});

describe('runStepDialogSave', () => {
  it('turns an unanswered form back to its first erroring step, with every field visited', async () => {
    store.open({ mode: 'create' });
    store.goToStep('summary');
    const opts = options();

    await runStepDialogSave(store, opts);

    const { open, step, visited } = store.$state.get();
    expect(open).toBe(true);
    expect(step).toBe('identity');
    expect([...visited]).toEqual(['name', 'displayName']);
    expect(opts.onSaved).not.toHaveBeenCalled();
  });

  it('closes an edit with nothing to send without writing', async () => {
    store.open({ mode: 'edit', entity: ALICE });
    const write = vi.fn();
    const opts = options({ write });

    await runStepDialogSave(store, opts);

    expect(store.$state.get().open).toBe(false);
    expect(write).not.toHaveBeenCalled();
    expect(opts.onSaved).not.toHaveBeenCalled();
  });

  it('writes a create, toasts, closes and reports what was written', async () => {
    store.open({ mode: 'create' });
    store.update({ displayName: 'Alice' });
    const afterWrite = vi.fn().mockResolvedValue(undefined);
    const opts = options({ afterWrite });

    await runStepDialogSave(store, opts);

    const written = { key: '', displayName: 'Alice' };
    expect(afterWrite).toHaveBeenCalledWith(written, { name: '', displayName: 'Alice' });
    expect(opts.notify).toHaveBeenCalledWith('success', '#notify.created#');
    expect(store.$state.get().open).toBe(false);
    expect(opts.onSaved).toHaveBeenCalledWith(written, 'create');
  });

  it('hands an edit its baseline and entity', async () => {
    store.open({ mode: 'edit', entity: ALICE });
    store.update({ displayName: 'Alice Cooper' });
    const write = vi.fn().mockReturnValue(okAsync({ key: 'alice', displayName: 'Alice Cooper' }));
    const opts = options({ write });

    await runStepDialogSave(store, opts);

    expect(write).toHaveBeenCalledWith(
      { name: 'alice', displayName: 'Alice Cooper' },
      { saved: { name: 'alice', displayName: 'Alice' }, mode: 'edit', entity: ALICE },
    );
    expect(opts.notify).toHaveBeenCalledWith('success', '#notify.updated#');
    expect(opts.onSaved).toHaveBeenCalledWith(
      { key: 'alice', displayName: 'Alice Cooper' },
      'edit',
    );
  });

  it('keeps a failed save open, unbusy, with a toast', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    store.open({ mode: 'edit', entity: ALICE });
    store.update({ displayName: 'Alice Cooper' });
    const opts = options({ write: () => errAsync(new AppError('refused')) });

    await runStepDialogSave(store, opts);

    const { open, saving } = store.$state.get();
    expect({ open, saving }).toEqual({ open: true, saving: false });
    expect(opts.notify).toHaveBeenCalledWith('error', '#notify.updateFailed#');
    expect(opts.onSaved).not.toHaveBeenCalled();
  });

  it('is busy while the write is in flight', async () => {
    store.open({ mode: 'create' });
    store.update({ displayName: 'Alice' });
    let busy = false;
    const opts = options({
      write: (form) => {
        busy = store.$state.get().saving;
        return okAsync({ key: form.name, displayName: form.displayName });
      },
    });

    await runStepDialogSave(store, opts);

    expect(busy).toBe(true);
  });
});
