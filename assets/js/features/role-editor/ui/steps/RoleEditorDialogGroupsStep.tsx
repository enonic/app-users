import { useStore } from '@nanostores/preact';

import { PrincipalPicker } from '../../../../entities/principal/ui/PrincipalPicker';
import { useI18n } from '../../../../shared/i18n';
import { $roleEditDetail } from '../../model/role-edit-detail';
import { $roleEditor, updateRoleEditorForm } from '../../model/role-editor.store';
import { roleMembersOf, withRoleMembersOf } from '../../model/role-form';

export function RoleEditorDialogGroupsStep() {
  const { form } = useStore($roleEditor, { keys: ['form'] });
  const { status } = useStore($roleEditDetail);

  const placeholder = useI18n('roles.dialog.groupsPlaceholder');
  const failedNotice = useI18n('roles.dialog.membersFailed');

  return (
    <>
      {status === 'error' && <p className="text-error mb-3 text-sm">{failedNotice}</p>}

      <PrincipalPicker
        kinds={['group']}
        showIdProvider
        placeholder={placeholder}
        selected={roleMembersOf(form.members, 'group')}
        onChange={(next) =>
          updateRoleEditorForm({ members: withRoleMembersOf(form.members, 'group', next) })
        }
      />
    </>
  );
}
