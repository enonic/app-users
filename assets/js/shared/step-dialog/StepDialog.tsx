import { ActionDialog, type FooterQuestion, useCloseGuard } from '@enonic/ui-kit';
import { useStore } from '@nanostores/preact';
import type { ComponentType } from 'preact';
import type { ReactNode } from 'react';

import { useI18n } from '../i18n';
import { useDialogLayer } from '../ui/dialogs/dialog-stack';
import type { StepDialogStore } from './step-dialog.store';
import { StepDialogFooter } from './StepDialogFooter';
import { StepDialogHeader } from './StepDialogHeader';

export type StepDialogProps<Step extends string, Field extends string, Form, Entity> = {
  store: StepDialogStore<Step, Field, Form, Entity>;
  glyph: ReactNode;
  panels: Record<Step, ComponentType>;
  /** Steps this open does not walk; a step that is never rendered is never in the stepper. */
  omit?: readonly Step[];
  onSave: () => void;
  /** The caller's name, so a test tells `UserEditorDialog` from `GroupEditorDialog`. */
  'data-component'?: string;
};

const STEP_DIALOG_NAME = 'StepDialog';

/**
 * The shell of a dialog made of steps. The store's `title` heads it, with the step title under it;
 * `panels` are pure content, wrapped in `StepContent` and locked here.
 *
 * ! Every way out but a save — overlay, Escape, the header's cross, Cancel — asks first while the form
 * ! is dirty. The question is the footer's: the body goes inert under it, and Escape is the way back.
 */
export function StepDialog<Step extends string, Field extends string, Form, Entity>({
  store,
  glyph,
  panels,
  omit,
  onSave,
  'data-component': componentName = STEP_DIALOG_NAME,
}: StepDialogProps<Step, Field, Form, Entity>) {
  const { open, view, step, saving } = useStore(store.$state, {
    keys: ['open', 'view', 'step', 'saving'],
  });
  const locks = useStore(store.$stepLocks);
  const dirty = useStore(store.$dirty);
  const { blocked } = useDialogLayer(open);

  const closeQuestion = useI18n('browse.dialog.closeQuestion');

  const guard = useCloseGuard({
    dirty,
    open,
    onOpenChange: (next) => {
      if (!next) {
        store.close();
      }
    },
  });

  const shown =
    view === 'wizard'
      ? store.steps.order.filter((value) => omit?.includes(value) !== true)
      : [step];

  const held = saving || blocked;

  const question: FooterQuestion | undefined = guard.asking
    ? { text: closeQuestion, onConfirm: guard.discard, onKeep: guard.keep }
    : undefined;

  return (
    <ActionDialog.Root
      open={open}
      step={step}
      onStepChange={(next) => store.goToStep(next as Step)}
      onOpenChange={(next, details) => {
        if (!held) {
          guard.onOpenChange(next, details);
        }
      }}
    >
      <ActionDialog.Portal>
        <ActionDialog.Overlay />
        <ActionDialog.Content
          data-component={componentName}
          className="gap-10 p-5 md:max-w-184 md:min-w-180 md:p-10"
          onEscapeKeyDown={(event) => {
            if (blocked) {
              event.preventDefault();
            }
          }}
        >
          <StepDialogHeader store={store} glyph={glyph} />

          <ActionDialog.Body className="-m-1.5 p-1.5">
            {shown.map((value) => {
              const Panel: ComponentType = panels[value];
              return (
                <ActionDialog.StepContent key={value} step={value} locked={locks[value]}>
                  <Panel />
                </ActionDialog.StepContent>
              );
            })}
          </ActionDialog.Body>

          <StepDialogFooter
            store={store}
            question={question}
            onSave={onSave}
            onCancel={() => {
              if (!held) {
                guard.requestClose();
              }
            }}
          />
        </ActionDialog.Content>
      </ActionDialog.Portal>
    </ActionDialog.Root>
  );
}

StepDialog.displayName = STEP_DIALOG_NAME;
