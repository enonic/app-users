import { useStore } from '@nanostores/preact';
import { useMemo } from 'preact/hooks';

import { isPinnedMembership, SYSTEM_USER_KEYS } from '../../../../entities/principal';
import { PrincipalPicker } from '../../../../entities/principal/ui/PrincipalPicker';
import { useI18n } from '../../../../shared/i18n';
import { $roleEditDetail } from '../../model/role-edit-detail';
import { $roleEditor, updateRoleEditorForm } from '../../model/role-editor.store';
import { roleMembersOf, withRoleMembersOf } from '../../model/role-form';

export function RoleEditorDialogUsersStep() {
  const { form, entity } = useStore($roleEditor, { keys: ['form', 'entity'] });
  const { status } = useStore($roleEditDetail);

  const placeholder = useI18n('roles.dialog.usersPlaceholder');
  const failedNotice = useI18n('roles.dialog.membersFailed');

  const users = useMemo(() => roleMembersOf(form.members, 'user'), [form.members]);

  // The platform refuses to part `su` and Administrators, so the row cannot be removed here either.
  const pinned = useMemo(
    () =>
      new Set(
        entity === undefined
          ? []
          : users.filter(({ key }) => isPinnedMembership(key, entity.key)).map(({ key }) => key),
      ),
    [entity, users],
  );

  return (
    <>
      {status === 'error' && <p className="text-error mb-3 text-sm">{failedNotice}</p>}

      <PrincipalPicker
        kinds={['user']}
        showIdProvider
        excluded={SYSTEM_USER_KEYS}
        locked={pinned}
        placeholder={placeholder}
        selected={users}
        onChange={(next) =>
          updateRoleEditorForm({ members: withRoleMembersOf(form.members, 'user', next) })
        }
      />
    </>
  );
}
