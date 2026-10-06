import { useStore } from '@nanostores/preact';
import { useMemo } from 'preact/hooks';

import { IMPLICIT_ROLE_KEYS, isPinnedMembership } from '../../../../entities/principal';
import { PrincipalPicker } from '../../../../entities/principal/ui/PrincipalPicker';
import { useI18n } from '../../../../shared/i18n';
import { $userEditDetail } from '../../model/user-edit-detail';
import { $userEditor, updateUserEditorForm } from '../../model/user-editor.store';

export function UserEditorDialogRoleStep() {
  const { form, entity } = useStore($userEditor, { keys: ['form', 'entity'] });
  const { status } = useStore($userEditDetail);

  const rolesPlaceholder = useI18n('users.dialog.rolesPlaceholder');
  const failedNotice = useI18n('users.dialog.membershipsFailed');

  // The platform refuses to part `su` and Administrators, so the row cannot be removed here either.
  const pinned = useMemo(
    () =>
      new Set(
        entity === undefined
          ? []
          : form.roles
              .filter(({ key }) => isPinnedMembership(entity.key, key))
              .map(({ key }) => key),
      ),
    [entity, form.roles],
  );

  return (
    <div className="flex flex-col gap-3">
      {status === 'error' && <p className="text-error text-sm">{failedNotice}</p>}

      <PrincipalPicker
        kinds={['role']}
        excluded={IMPLICIT_ROLE_KEYS}
        locked={pinned}
        placeholder={rolesPlaceholder}
        selected={form.roles}
        onChange={(roles) => updateUserEditorForm({ roles })}
      />
    </div>
  );
}
