import { Button, Dialog } from '@enonic/ui';
import { useStore } from '@nanostores/preact';

import { i18n } from '../i18n';
import type { StepDialogStore } from './step-dialog.store';

export type StepDialogFooterProps<Step extends string, Field extends string, Form, Entity> = {
  store: StepDialogStore<Step, Field, Form, Entity>;
  onSave: () => void;
};

/** The stepper in wizard view; Cancel and Save in step view. */
export function StepDialogFooter<Step extends string, Field extends string, Form, Entity>({
  store,
  onSave,
}: StepDialogFooterProps<Step, Field, Form, Entity>) {
  const { view, mode, saving } = useStore(store.$state, { keys: ['view', 'mode', 'saving'] });
  const errors = useStore(store.$errors);
  const changed = useStore(store.$changed);

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
        onClick={() => store.close()}
      />
      <Button
        variant="solid"
        label={i18n('browse.dialog.save')}
        disabled={saving || unanswered || !changed}
        onClick={onSave}
      />
    </Dialog.Footer>
  );
}
