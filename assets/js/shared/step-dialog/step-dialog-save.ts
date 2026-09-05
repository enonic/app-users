import type { ResultAsync } from 'neverthrow';

import type { AppError } from '../api';
import { i18n } from '../i18n';
import type { StepDialogMode, StepDialogStore } from './step-dialog.store';

export type StepDialogWriteContext<Form, Entity> = {
  saved: Form;
  mode: StepDialogMode;
  entity?: Entity;
};

/**
 * `write` is the mutation; `afterWrite` runs once the entity exists, before the dialog closes. `notices`
 * are phrase keys, the two successes taking the written display name as `{0}`.
 */
export type StepDialogSaveOptions<Form, Entity, Written extends { displayName: string }> = {
  write: (
    form: Form,
    context: StepDialogWriteContext<Form, Entity>,
  ) => ResultAsync<Written, AppError>;
  afterWrite?: (written: Written, form: Form) => Promise<void>;
  notices: { created: string; updated: string; createFailed: string; updateFailed: string };
  notify: (level: 'success' | 'error', message: string) => void;
  onSaved: (written: Written, mode: StepDialogMode) => void;
};

/**
 * An unanswered form goes back to its first erroring step with every field marked visited; an unchanged
 * edit just closes. The gate is whole-form in `'step'` view too: a section only opens on an entity the
 * form already accepts.
 */
export async function runStepDialogSave<
  Step extends string,
  Field extends string,
  Form,
  Entity,
  Written extends { displayName: string },
>(
  store: StepDialogStore<Step, Field, Form, Entity>,
  { write, afterWrite, notices, notify, onSaved }: StepDialogSaveOptions<Form, Entity, Written>,
): Promise<void> {
  const { steps } = store;
  const { form, saved, mode, entity } = store.$state.get();
  const unanswered = steps.firstWithError(store.$errors.get());

  if (unanswered !== undefined) {
    steps.allFields.forEach(store.markVisited);
    store.goToStep(unanswered);
    return;
  }

  if (!store.$changed.get()) {
    store.close();
    return;
  }

  store.beginSave();

  const written = await write(form, { saved, mode, entity });

  await written.match(
    async (result) => {
      await afterWrite?.(result, form);
      notify(
        'success',
        i18n(mode === 'edit' ? notices.updated : notices.created, result.displayName),
      );
      store.close();
      onSaved(result, mode);
    },
    async (error) => {
      console.error(error.message);
      notify('error', i18n(mode === 'edit' ? notices.updateFailed : notices.createFailed));
      store.endSave();
    },
  );
}
