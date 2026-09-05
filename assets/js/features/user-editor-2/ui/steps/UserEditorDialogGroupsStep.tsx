import { Checkbox, Dialog } from '@enonic/ui';
import { useStore } from '@nanostores/preact';
import { useState } from 'preact/hooks';

import { PrincipalPicker } from '../../../../entities/principal/ui/PrincipalPicker';
import { i18n, useI18n } from '../../../../shared/i18n';
import { $userEditDetail } from '../../model/user-edit-detail';
import { USER_EDITOR_STEPS } from '../../model/user-editor-steps';
import {
  $userEditor,
  $userEditorStepLocks,
  $userEditorSystemUser,
  updateUserEditorForm,
} from '../../model/user-editor.store';

const STEP = USER_EDITOR_STEPS.groups;

export function UserEditorDialogGroupsStep() {
  const { form } = useStore($userEditor, { keys: ['form'] });
  const locks = useStore($userEditorStepLocks);
  const systemUser = useStore($userEditorSystemUser);
  const { status } = useStore($userEditDetail);

  const [showAll, setShowAll] = useState(false);

  const groupsPlaceholder = useI18n('users.dialog.groupsPlaceholder');
  const showAllLabel = useI18n('users.dialog.showAllGroups');
  const failedNotice = useI18n('users.dialog.membershipsFailed');

  if (systemUser) {
    return (
      <Dialog.StepContent step={STEP} locked={locks[STEP]}>
        <p className="text-subtle text-sm">{i18n('users.dialog.platformOwnedGroups')}</p>
      </Dialog.StepContent>
    );
  }

  return (
    <Dialog.StepContent step={STEP} locked={locks[STEP]}>
      {status === 'error' && <p className="text-error mb-3 text-sm">{failedNotice}</p>}

      <div className="flex items-start gap-4">
        {/* ! `min-w-0`: the column is a flex child at `min-width: auto`, so without it a long group
            ! name widens the picker and pushes the checkbox out of the row. */}
        <div className="min-w-0 flex-1">
          <PrincipalPicker
            kinds={['group']}
            idProvider={showAll ? undefined : form.idProvider}
            placeholder={groupsPlaceholder}
            selected={form.groups}
            onChange={(groups) => updateUserEditorForm({ groups })}
          />
        </div>

        {/* The height matches the combobox, so the checkbox sits beside the input rather than beside
            the picked list that grows under it. */}
        <div className="flex h-12 shrink-0 items-center">
          <Checkbox
            label={showAllLabel}
            checked={showAll}
            onCheckedChange={(checked) => setShowAll(checked === true)}
          />
        </div>
      </div>
    </Dialog.StepContent>
  );
}
