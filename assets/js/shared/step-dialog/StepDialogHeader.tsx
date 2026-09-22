import { Dialog } from '@enonic/ui';
import { useStore } from '@nanostores/preact';
import type { ReactNode } from 'react';

import { i18n } from '../i18n';
import type { StepDialogStore } from './step-dialog.store';

export type StepDialogHeaderProps<Step extends string, Field extends string, Form, Entity> = {
  store: StepDialogStore<Step, Field, Form, Entity>;
  glyph: ReactNode;
};

export function StepDialogHeader<Step extends string, Field extends string, Form, Entity>({
  store,
  glyph,
}: StepDialogHeaderProps<Step, Field, Form, Entity>) {
  const { title, step } = useStore(store.$state, { keys: ['title', 'step'] });
  const stepTitle = i18n(store.steps.titles[step]);

  return (
    <Dialog.Header className="grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-4">
      {glyph}

      <span className="bg-bdr-subtle h-10 w-px" aria-hidden />

      <span className="flex min-w-0 flex-col">
        <Dialog.Title className="truncate text-xl font-semibold">{title}</Dialog.Title>

        <span className="truncate text-sm font-semibold">{stepTitle}</span>
      </span>

      <Dialog.DefaultClose className="justify-self-end" />
    </Dialog.Header>
  );
}
