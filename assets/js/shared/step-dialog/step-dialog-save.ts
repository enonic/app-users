import type { AppError } from '@enonic/ui-utils';
import type { ResultAsync } from 'neverthrow';

import { serverReason } from '../api';
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
 * A failure as it is told: what failed, already localized, and why if the server said. The reason is
 * the server's own sentence — a refusal of the platform's names the principal and the rule, which no
 * phrase of this app could.
 */
export function failureNotice(failed: string, error: { message: string } | undefined): string {
  const reason = error === undefined ? '' : serverReason(error.message);

  return reason.length === 0 ? failed : i18n('browse.dialog.failedReason', failed, reason);
}

/**
 * An unanswered form goes back to the step `$unanswered` names with every field marked visited; an
 * unchanged edit just closes.
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
  const unanswered = store.$unanswered.get();

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
      notify(
        'error',
        failureNotice(i18n(mode === 'edit' ? notices.updateFailed : notices.createFailed), error),
      );
      store.endSave();
    },
  );
}
