import { UserShield } from 'lucide-react';

import { createRole, updateRole, type Role } from '../../../entities/principal';
import { useHostFrame } from '../../../shared/host';
import { runStepDialogSave, type StepDialogMode } from '../../../shared/step-dialog';
import { StepDialog } from '../../../shared/step-dialog/StepDialog';
import { roleDraftFrom } from '../model/role-draft';
import { roleEditFrom } from '../model/role-edit';
import { roleEditorDialog } from '../model/role-editor.store';
import { ROLE_EDITOR_STEP_PANELS } from './steps';

const TITLES: Record<StepDialogMode, string> = {
  create: 'roles.dialog.createTitle',
  edit: 'roles.dialog.editTitle',
};

const NOTICES = {
  created: 'roles.notify.created',
  updated: 'roles.notify.updated',
  createFailed: 'roles.notify.createFailed',
  updateFailed: 'roles.notify.updateFailed',
};

export type RoleEditorDialogProps = {
  onSaved: (written: Role, mode: StepDialogMode) => void;
};

export function RoleEditorDialog({ onSaved }: RoleEditorDialogProps) {
  const { notify } = useHostFrame();

  const save = (): Promise<void> =>
    runStepDialogSave(roleEditorDialog, {
      write: (form, { saved, mode, entity }) =>
        mode === 'edit' && entity !== undefined
          ? updateRole(entity.key, roleEditFrom(form, saved))
          : createRole(roleDraftFrom(form)),
      notices: NOTICES,
      notify,
      onSaved,
    });

  return (
    <StepDialog
      store={roleEditorDialog}
      glyph={<UserShield size={40} strokeWidth={1.5} className="text-main" aria-hidden />}
      titles={TITLES}
      panels={ROLE_EDITOR_STEP_PANELS}
      onSave={() => void save()}
    />
  );
}
