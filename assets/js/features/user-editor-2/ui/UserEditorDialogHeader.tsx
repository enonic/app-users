import { Dialog } from '@enonic/ui';
import { useStore } from '@nanostores/preact';
import { User } from 'lucide-react';

import { i18n } from '../../../shared/i18n';
import { USER_EDITOR_STEP_TITLES } from '../model/user-editor-steps';
import { $userEditor, type UserEditorMode } from '../model/user-editor.store';

const MODE_TITLES: Record<UserEditorMode, string> = {
  create: 'users.dialog.createTitle',
  edit: 'users.dialog.editTitle',
};

export function UserEditorDialogHeader() {
  const { mode, step } = useStore($userEditor, { keys: ['mode', 'step'] });
  const modeTitle = i18n(MODE_TITLES[mode]);
  const stepTitle = i18n(USER_EDITOR_STEP_TITLES[step]);

  return (
    <Dialog.Header className="grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-4">
      <User size={40} strokeWidth={1.5} className="text-main" aria-hidden />

      <span className="bg-bdr-subtle h-10 w-px" aria-hidden />

      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold">{modeTitle}</span>

        <Dialog.Title className="truncate text-2xl font-semibold">{stepTitle}</Dialog.Title>
      </span>

      <Dialog.DefaultClose className="justify-self-end" />
    </Dialog.Header>
  );
}
