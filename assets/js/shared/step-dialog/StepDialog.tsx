import { Dialog } from '@enonic/ui';
import { useStore } from '@nanostores/preact';
import type { ComponentType } from 'preact';
import { useState } from 'preact/hooks';
import type { ReactNode } from 'react';

import { useI18n } from '../i18n';
import { ConfirmDialog } from '../ui/dialogs/ConfirmDialog';
import { useDialogLayer } from '../ui/dialogs/dialog-stack';
import type { StepDialogMode, StepDialogStore } from './step-dialog.store';
import { StepDialogFooter } from './StepDialogFooter';
import { StepDialogHeader } from './StepDialogHeader';

export type StepDialogProps<Step extends string, Field extends string, Form, Entity> = {
  store: StepDialogStore<Step, Field, Form, Entity>;
  glyph: ReactNode;
  titles: Record<StepDialogMode, string>;
  panels: Record<Step, ComponentType>;
  onSave: () => void;
};

/**
 * The shell of a dialog made of steps. `titles` are the mode eyebrows as phrase keys; `panels` are pure
 * content, wrapped in `StepContent` and locked here.
 *
 * ! Every way out but a save — overlay, Escape, the header's cross, Cancel — asks first while the form
 * ! is dirty. The confirm is a layer above this one, so the gesture that answers it never reaches here.
 */
export function StepDialog<Step extends string, Field extends string, Form, Entity>({
  store,
  glyph,
  titles,
  panels,
  onSave,
}: StepDialogProps<Step, Field, Form, Entity>) {
  const { open, view, step, saving } = useStore(store.$state, {
    keys: ['open', 'view', 'step', 'saving'],
  });
  const locks = useStore(store.$stepLocks);
  const dirty = useStore(store.$dirty);
  const { blocked } = useDialogLayer(open);
  const [closing, setClosing] = useState(false);

  const closeQuestion = useI18n('browse.dialog.closeQuestion');

  const shown = view === 'wizard' ? store.steps.order : [step];

  const requestClose = (): void => {
    if (saving || blocked) {
      return;
    }

    if (dirty) {
      setClosing(true);
    } else {
      store.close();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        step={step}
        onStepChange={(next) => store.goToStep(next as Step)}
        onOpenChange={(next) => {
          if (!next) {
            requestClose();
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content
            className="gap-10 p-5 md:max-w-184 md:min-w-180 md:p-10"
            onEscapeKeyDown={(event) => {
              if (blocked) {
                event.preventDefault();
              }
            }}
          >
            <StepDialogHeader store={store} glyph={glyph} titles={titles} />

            <Dialog.Body className="-m-1.5 p-1.5">
              {shown.map((value) => {
                const Panel: ComponentType = panels[value];
                return (
                  <Dialog.StepContent key={value} step={value} locked={locks[value]}>
                    <Panel />
                  </Dialog.StepContent>
                );
              })}
            </Dialog.Body>

            <StepDialogFooter store={store} onSave={onSave} onCancel={requestClose} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

      <ConfirmDialog
        open={closing}
        question={closeQuestion}
        onConfirm={() => {
          setClosing(false);
          store.close();
        }}
        onClose={() => setClosing(false)}
      />
    </>
  );
}
