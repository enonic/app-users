import { Dialog } from '@enonic/ui';
import { useStore } from '@nanostores/preact';
import type { ReactNode } from 'react';

import { i18n } from '../i18n';
import type { StepDialogMode, StepDialogStore } from './step-dialog.store';

export type StepDialogHeaderProps<Step extends string, Field extends string, Form, Entity> = {
  store: StepDialogStore<Step, Field, Form, Entity>;
  glyph: ReactNode;
  titles: Record<StepDialogMode, string>;
};

export function StepDialogHeader<Step extends string, Field extends string, Form, Entity>({
  store,
  glyph,
  titles,
}: StepDialogHeaderProps<Step, Field, Form, Entity>) {
  const { mode, step } = useStore(store.$state, { keys: ['mode', 'step'] });
  const modeTitle = i18n(titles[mode]);
  const stepTitle = i18n(store.steps.titles[step]);

  return (
    <Dialog.Header className="grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-4">
      {glyph}

      <span className="bg-bdr-subtle h-10 w-px" aria-hidden />

      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold">{modeTitle}</span>

        <Dialog.Title className="truncate text-2xl font-semibold">{stepTitle}</Dialog.Title>
      </span>

      <Dialog.DefaultClose className="justify-self-end" />
    </Dialog.Header>
  );
}
