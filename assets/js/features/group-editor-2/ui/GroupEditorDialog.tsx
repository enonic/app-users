import { useStore } from '@nanostores/preact';
import { Users } from 'lucide-react';
import { useEffect } from 'preact/hooks';

import { createGroup, updateGroup, type Group } from '../../../entities/principal';
import { useHostFrame } from '../../../shared/host';
import { runStepDialogSave, type StepDialogMode } from '../../../shared/step-dialog';
import { StepDialog } from '../../../shared/step-dialog/StepDialog';
import { groupDraftFrom } from '../model/group-draft';
import { groupEditFrom } from '../model/group-edit';
import { forgetGroupEditDetail, showGroupForEdit } from '../model/group-edit-detail';
import { $groupEditor, groupEditorDialog } from '../model/group-editor.store';
import { useGroupEditorLists } from '../model/useGroupEditorLists';
import { GROUP_EDITOR_STEP_PANELS } from './steps';

const TITLES: Record<StepDialogMode, string> = {
  create: 'groups.dialog.createTitle',
  edit: 'groups.dialog.editTitle',
};

const NOTICES = {
  created: 'groups.notify.created',
  updated: 'groups.notify.updated',
  createFailed: 'groups.notify.createFailed',
  updateFailed: 'groups.notify.updateFailed',
};

export type GroupEditorDialogProps = {
  onSaved: (written: Group, mode: StepDialogMode) => void;
};

export function GroupEditorDialog({ onSaved }: GroupEditorDialogProps) {
  const { entity } = useStore($groupEditor, { keys: ['entity'] });
  const { notify } = useHostFrame();

  useGroupEditorLists();

  const editedKey = entity?.key;

  // The detail carries the members and the roles the later steps seed from.
  useEffect(() => {
    showGroupForEdit(editedKey);

    return forgetGroupEditDetail;
  }, [editedKey]);

  const save = (): Promise<void> =>
    runStepDialogSave(groupEditorDialog, {
      write: (form, { saved, mode, entity }) =>
        mode === 'edit' && entity !== undefined
          ? updateGroup(entity.key, groupEditFrom(form, saved))
          : createGroup(groupDraftFrom(form)),
      notices: NOTICES,
      notify,
      onSaved,
    });

  return (
    <StepDialog
      store={groupEditorDialog}
      glyph={<Users size={40} strokeWidth={1.5} className="text-main" aria-hidden />}
      titles={TITLES}
      panels={GROUP_EDITOR_STEP_PANELS}
      onSave={() => void save()}
    />
  );
}
