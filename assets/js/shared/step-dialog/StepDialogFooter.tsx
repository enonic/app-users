import { Button } from '@enonic/ui';
import { ActionDialog, type FooterQuestion } from '@enonic/ui-kit';
import { useStore } from '@nanostores/preact';

import { i18n } from '../i18n';
import type { StepDialogStore } from './step-dialog.store';

export type StepDialogFooterProps<Step extends string, Field extends string, Form, Entity> = {
  store: StepDialogStore<Step, Field, Form, Entity>;
  /** The dirty-close question, asked in place of the controls while set. */
  question?: FooterQuestion;
  onSave: () => void;
  onCancel: () => void;
  'data-component'?: string;
};

const STEP_DIALOG_FOOTER_NAME = 'StepDialogFooter';

/** The stepper in wizard view; Cancel and Save in step view. */
export function StepDialogFooter<Step extends string, Field extends string, Form, Entity>({
  store,
  question,
  onSave,
  onCancel,
  'data-component': componentName = STEP_DIALOG_FOOTER_NAME,
}: StepDialogFooterProps<Step, Field, Form, Entity>) {
  const { view, mode, saving } = useStore(store.$state, { keys: ['view', 'mode', 'saving'] });
  const unanswered = useStore(store.$unanswered);
  const changed = useStore(store.$changed);

  if (view === 'wizard') {
    return (
      <ActionDialog.Footer data-component={componentName} question={question}>
        <ActionDialog.StepIndicator
          previousLabel={i18n('browse.dialog.previous')}
          nextLabel={i18n('browse.dialog.next')}
          lastStepLabel={i18n(mode === 'edit' ? 'browse.dialog.save' : 'browse.dialog.create')}
          onLastStep={onSave}
          pending={saving}
          dots
        />
      </ActionDialog.Footer>
    );
  }

  return (
    <ActionDialog.Footer data-component={componentName} question={question}>
      <Button
        variant="text"
        size="lg"
        label={i18n('browse.dialog.cancel')}
        disabled={saving}
        onClick={onCancel}
      />
      <ActionDialog.Action
        label={i18n('browse.dialog.save')}
        disabled={saving || unanswered !== undefined || !changed}
        closeOnClick={false}
        onClick={onSave}
      />
    </ActionDialog.Footer>
  );
}

StepDialogFooter.displayName = STEP_DIALOG_FOOTER_NAME;
