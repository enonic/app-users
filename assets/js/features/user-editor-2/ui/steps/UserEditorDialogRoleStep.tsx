import { useStore } from '@nanostores/preact';

import { IMPLICIT_ROLE_KEYS } from '../../../../entities/principal';
import { PrincipalPicker } from '../../../../entities/principal/ui/PrincipalPicker';
import { i18n, useI18n } from '../../../../shared/i18n';
import { $userEditDetail } from '../../model/user-edit-detail';
import {
  $userEditor,
  $userEditorSystemUser,
  updateUserEditorForm,
} from '../../model/user-editor.store';

export function UserEditorDialogRoleStep() {
  const { form } = useStore($userEditor, { keys: ['form'] });
  const systemUser = useStore($userEditorSystemUser);
  const { status } = useStore($userEditDetail);

  const rolesPlaceholder = useI18n('users.dialog.rolesPlaceholder');
  const failedNotice = useI18n('users.dialog.membershipsFailed');

  if (systemUser) {
    return <p className="text-subtle text-sm">{i18n('users.dialog.platformOwnedRoles')}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {status === 'error' && <p className="text-error text-sm">{failedNotice}</p>}

      <PrincipalPicker
        kinds={['role']}
        excluded={IMPLICIT_ROLE_KEYS}
        placeholder={rolesPlaceholder}
        selected={form.roles}
        onChange={(roles) => updateUserEditorForm({ roles })}
      />
    </div>
  );
}
