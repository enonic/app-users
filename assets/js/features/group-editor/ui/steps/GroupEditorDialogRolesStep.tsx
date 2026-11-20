import { useStore } from '@nanostores/preact';

import { IMPLICIT_ROLE_KEYS, useAdministratorOnly } from '../../../../entities/principal';
import { PrincipalPicker } from '../../../../entities/principal/ui/PrincipalPicker';
import { useI18n } from '../../../../shared/i18n';
import { $groupEditDetail } from '../../model/group-edit-detail';
import { $groupEditor, updateGroupEditorForm } from '../../model/group-editor.store';

export function GroupEditorDialogRolesStep() {
  const { form } = useStore($groupEditor, { keys: ['form'] });
  const { status } = useStore($groupEditDetail);
  // The administrator role, shown inert to a caller who may not change who holds it.
  const adminOnly = useAdministratorOnly();

  const rolesPlaceholder = useI18n('groups.dialog.rolesPlaceholder');
  const failedNotice = useI18n('groups.dialog.listsFailed');

  return (
    <div className="flex flex-col gap-3">
      {status === 'error' && <p className="text-error text-sm">{failedNotice}</p>}

      <PrincipalPicker
        kinds={['role']}
        excluded={IMPLICIT_ROLE_KEYS}
        locked={adminOnly}
        placeholder={rolesPlaceholder}
        selected={form.roles}
        onChange={(roles) => updateGroupEditorForm({ roles })}
      />
    </div>
  );
}
