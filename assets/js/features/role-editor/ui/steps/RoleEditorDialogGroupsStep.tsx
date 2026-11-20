import { useStore } from '@nanostores/preact';

import { useAdministratorLock } from '../../../../entities/principal';
import { PrincipalPicker } from '../../../../entities/principal/ui/PrincipalPicker';
import { useI18n } from '../../../../shared/i18n';
import { $roleEditDetail } from '../../model/role-edit-detail';
import { $roleEditor, updateRoleEditorForm } from '../../model/role-editor.store';
import { roleMembersOf, withRoleMembersOf } from '../../model/role-form';

export function RoleEditorDialogGroupsStep() {
  const { form, entity } = useStore($roleEditor, { keys: ['form', 'entity'] });
  const { status } = useStore($roleEditDetail);
  const { locked } = useAdministratorLock(entity?.key);

  const placeholder = useI18n('roles.dialog.groupsPlaceholder');
  const failedNotice = useI18n('roles.dialog.membersFailed');
  const lockedNotice = useI18n('principal.details.lockedAdministratorRole');

  return (
    <>
      {status === 'error' && <p className="text-error mb-3 text-sm">{failedNotice}</p>}
      {locked && <p className="text-subtle mb-3 text-sm">{lockedNotice}</p>}

      <PrincipalPicker
        kinds={['group']}
        showIdProvider
        readOnly={locked}
        placeholder={placeholder}
        selected={roleMembersOf(form.members, 'group')}
        onChange={(next) =>
          updateRoleEditorForm({ members: withRoleMembersOf(form.members, 'group', next) })
        }
      />
    </>
  );
}
