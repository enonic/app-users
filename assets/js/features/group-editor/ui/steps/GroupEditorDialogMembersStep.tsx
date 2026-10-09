import { Toggle } from '@enonic/ui';
import { useStore } from '@nanostores/preact';
import { useMemo, useState } from 'preact/hooks';

import { SYSTEM_USER_KEYS } from '../../../../entities/principal';
import { PrincipalPicker } from '../../../../entities/principal/ui/PrincipalPicker';
import { useI18n } from '../../../../shared/i18n';
import { $groupEditDetail } from '../../model/group-edit-detail';
import { $groupEditor, updateGroupEditorForm } from '../../model/group-editor.store';

export function GroupEditorDialogMembersStep() {
  const { form, entity } = useStore($groupEditor, { keys: ['form', 'entity'] });
  const { status } = useStore($groupEditDetail);

  const membersPlaceholder = useI18n('groups.dialog.membersPlaceholder');
  const showAllLabel = useI18n('groups.dialog.showAllProviders');
  const failedNotice = useI18n('groups.dialog.listsFailed');

  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState(false);

  // The platform refuses a relationship whose two ends are the same principal; the users it owns are
  // kept out for the reason `SYSTEM_USER_KEYS` gives.
  const excluded = useMemo(
    () => new Set(entity === undefined ? SYSTEM_USER_KEYS : [...SYSTEM_USER_KEYS, entity.key]),
    [entity],
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
        kinds={['user', 'group']}
        idProvider={showAll ? undefined : form.idProvider}
        showIdProvider
        open={open}
        onOpenChange={setOpen}
        placeholder={membersPlaceholder}
        selected={form.members}
        excluded={excluded}
        onChange={(members) => updateGroupEditorForm({ members })}
      />
    </div>
  );
}
