import { Checkbox } from '@enonic/ui';
import { useStore } from '@nanostores/preact';
import { useState } from 'preact/hooks';

import { PrincipalPicker } from '../../../../entities/principal/ui/PrincipalPicker';
import { i18n, useI18n } from '../../../../shared/i18n';
import { $userEditDetail } from '../../model/user-edit-detail';
import {
  $userEditor,
  $userEditorSystemUser,
  updateUserEditorForm,
} from '../../model/user-editor.store';

export function UserEditorDialogGroupsStep() {
  const { form } = useStore($userEditor, { keys: ['form'] });
  const systemUser = useStore($userEditorSystemUser);
  const { status } = useStore($userEditDetail);

  const [showAll, setShowAll] = useState(false);

  const groupsPlaceholder = useI18n('users.dialog.groupsPlaceholder');
  const showAllLabel = useI18n('users.dialog.showAllGroups');
  const failedNotice = useI18n('users.dialog.membershipsFailed');

  if (systemUser) {
    return <p className="text-subtle text-sm">{i18n('users.dialog.platformOwnedGroups')}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {status === 'error' && <p className="text-error text-sm">{failedNotice}</p>}

      <Checkbox
        label={showAllLabel}
        checked={showAll}
        onCheckedChange={(checked) => setShowAll(checked === true)}
      />

      <PrincipalPicker
        kinds={['group']}
        idProvider={showAll ? undefined : form.idProvider}
        showIdProvider
        placeholder={groupsPlaceholder}
        selected={form.groups}
        onChange={(groups) => updateUserEditorForm({ groups })}
      />
    </div>
  );
}
