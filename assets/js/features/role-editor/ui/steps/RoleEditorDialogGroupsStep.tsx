import { useStore } from '@nanostores/preact';

import { PrincipalPicker } from '../../../../entities/principal/ui/PrincipalPicker';
import { useI18n } from '../../../../shared/i18n';
import { $roleEditDetail } from '../../model/role-edit-detail';
import { $roleEditor, updateRoleEditorForm } from '../../model/role-editor.store';

export function RoleEditorDialogGroupsStep() {
  const { form } = useStore($roleEditor, { keys: ['form'] });
  const { status } = useStore($roleEditDetail);

  const placeholder = useI18n('roles.dialog.groupsPlaceholder');
  const failedNotice = useI18n('roles.dialog.membersFailed');

  // One members list behind both steps: this one picks its own kind and keeps the other's.
  const picked = form.members.filter(({ type }) => type === 'group');
  const others = form.members.filter(({ type }) => type !== 'group');

  return (
    <>
      {status === 'error' && <p className="text-error mb-3 text-sm">{failedNotice}</p>}

      <PrincipalPicker
        kinds={['group']}
        showIdProvider
        placeholder={placeholder}
        selected={picked}
        onChange={(next) => updateRoleEditorForm({ members: [...others, ...next] })}
      />
    </>
  );
}
