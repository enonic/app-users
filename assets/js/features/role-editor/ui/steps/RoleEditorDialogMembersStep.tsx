import { useStore } from '@nanostores/preact';

import { PrincipalPicker } from '../../../../entities/principal/ui/PrincipalPicker';
import { useI18n } from '../../../../shared/i18n';
import { $roleEditDetail } from '../../model/role-edit-detail';
import { $roleEditor, updateRoleEditorForm } from '../../model/role-editor.store';

export function RoleEditorDialogMembersStep() {
  const { form } = useStore($roleEditor, { keys: ['form'] });
  const { status } = useStore($roleEditDetail);

  const membersPlaceholder = useI18n('roles.dialog.membersPlaceholder');
  const failedNotice = useI18n('roles.dialog.membersFailed');

  return (
    <>
      {status === 'error' && <p className="text-error mb-3 text-sm">{failedNotice}</p>}

      <PrincipalPicker
        kinds={['user', 'group']}
        placeholder={membersPlaceholder}
        selected={form.members}
        onChange={(members) => updateRoleEditorForm({ members })}
      />
    </>
  );
}
