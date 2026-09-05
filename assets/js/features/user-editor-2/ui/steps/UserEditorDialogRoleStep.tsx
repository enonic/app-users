import { Dialog } from '@enonic/ui';
import { useStore } from '@nanostores/preact';

import { IMPLICIT_ROLE_KEYS } from '../../../../entities/principal';
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

const STEP = USER_EDITOR_STEPS.roles;

export function UserEditorDialogRoleStep() {
  const { form } = useStore($userEditor, { keys: ['form'] });
  const locks = useStore($userEditorStepLocks);
  const systemUser = useStore($userEditorSystemUser);
  const { status } = useStore($userEditDetail);

  const rolesPlaceholder = useI18n('users.dialog.rolesPlaceholder');
  const failedNotice = useI18n('users.dialog.membershipsFailed');

  return (
    <Dialog.StepContent step={STEP} locked={locks[STEP]}>
      {systemUser ? (
        <p className="text-subtle text-sm">{i18n('users.dialog.platformOwnedRoles')}</p>
      ) : (
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
      )}
    </Dialog.StepContent>
  );
}
