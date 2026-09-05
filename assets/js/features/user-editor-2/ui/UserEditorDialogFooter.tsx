import { Button, Dialog } from '@enonic/ui';
import { useStore } from '@nanostores/preact';

import { i18n } from '../../../shared/i18n';
import { $userEditor, $userEditorErrors, closeUserEditor } from '../model/user-editor.store';
import { sameUserForm } from '../model/user-form';

export type UserEditorDialogFooterProps = {
  onSave: () => void;
};

/**
 * The wizard walks with the stepper; a single step is a plain edit, so it gets Cancel and Save instead.
 * That swap is the whole difference between the two views.
 */
export function UserEditorDialogFooter({ onSave }: UserEditorDialogFooterProps) {
  const { view, mode, form, saved, saving } = useStore($userEditor, {
    keys: ['view', 'mode', 'form', 'saved', 'saving'],
  });
  const errors = useStore($userEditorErrors);

  if (view === 'wizard') {
    return (
      <Dialog.Footer>
        <Dialog.StepIndicator
          previousLabel={i18n('browse.dialog.previous')}
          nextLabel={i18n('browse.dialog.next')}
          lastStepLabel={i18n(mode === 'edit' ? 'browse.dialog.save' : 'browse.dialog.create')}
          onLastStep={onSave}
          pending={saving}
          dots
        />
      </Dialog.Footer>
    );
  }

  const unanswered = Object.keys(errors).length > 0;

  return (
    <Dialog.Footer className="items-center">
      <Button
        variant="text"
        label={i18n('browse.dialog.cancel')}
        disabled={saving}
        onClick={() => closeUserEditor()}
      />
      <Button
        variant="solid"
        label={i18n('browse.dialog.save')}
        disabled={saving || unanswered || sameUserForm(saved, form)}
        onClick={onSave}
      />
    </Dialog.Footer>
  );
}
