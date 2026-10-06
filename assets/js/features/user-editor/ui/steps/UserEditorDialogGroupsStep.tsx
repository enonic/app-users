import { Toggle } from '@enonic/ui';
import { useStore } from '@nanostores/preact';
import { useMemo, useState } from 'preact/hooks';

import { $idProviderModeByKey, allowsWrite, idProviderOf } from '../../../../entities/principal';
import { PrincipalPicker } from '../../../../entities/principal/ui/PrincipalPicker';
import { useI18n } from '../../../../shared/i18n';
import { $userEditDetail } from '../../model/user-edit-detail';
import { $userEditor, updateUserEditorForm } from '../../model/user-editor.store';

export function UserEditorDialogGroupsStep() {
  const { form } = useStore($userEditor, { keys: ['form'] });
  const { status } = useStore($userEditDetail);
  const modes = useStore($idProviderModeByKey);

  const groupsPlaceholder = useI18n('users.dialog.groupsPlaceholder');
  const showAllLabel = useI18n('users.dialog.showAllProviders');
  const failedNotice = useI18n('users.dialog.membershipsFailed');

  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState(false);

  // ! A group a remote system owns keeps its members there: it is not offered, and a membership the user
  // ! already holds in one cannot be removed here — the server refuses both.
  const remoteProviders = useMemo(
    () => new Set([...modes].filter(([, mode]) => !allowsWrite(mode, 'group')).map(([key]) => key)),
    [modes],
  );
  const remoteGroups = useMemo(
    () =>
      new Set(
        form.groups
          .filter(({ key }) => remoteProviders.has(idProviderOf(key) ?? ''))
          .map(({ key }) => key),
      ),
    [form.groups, remoteProviders],
  );

  return (
    <div className="flex flex-col gap-3">
      {status === 'error' && <p className="text-error text-sm">{failedNotice}</p>}

      <div className="flex justify-end">
        <Toggle
          size="sm"
          className="-my-1 h-8 px-1.5 focus-visible:ring-offset-0"
          label={showAllLabel}
          pressed={showAll}
          onPressedChange={(next) => {
            setShowAll(next);
            setOpen(true);
          }}
        />
      </div>

      <PrincipalPicker
        kinds={['group']}
        idProvider={showAll ? undefined : form.idProvider}
        showIdProvider
        open={open}
        onOpenChange={setOpen}
        placeholder={groupsPlaceholder}
        selected={form.groups}
        excludedIdProviders={remoteProviders}
        locked={remoteGroups}
        onChange={(groups) => updateUserEditorForm({ groups })}
      />
    </div>
  );
}
