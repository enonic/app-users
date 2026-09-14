import { Checkbox } from '@enonic/ui';
import { useStore } from '@nanostores/preact';
import { useMemo, useState } from 'preact/hooks';

import { PrincipalPicker } from '../../../../entities/principal/ui/PrincipalPicker';
import { useI18n } from '../../../../shared/i18n';
import { $groupEditDetail } from '../../model/group-edit-detail';
import { $groupEditor, updateGroupEditorForm } from '../../model/group-editor.store';

export function GroupEditorDialogMembersStep() {
  const { form, entity } = useStore($groupEditor, { keys: ['form', 'entity'] });
  const { status } = useStore($groupEditDetail);

  const membersPlaceholder = useI18n('groups.dialog.membersPlaceholder');
  const showAllLabel = useI18n('groups.dialog.showAllMembers');
  const failedNotice = useI18n('groups.dialog.listsFailed');

  const [showAll, setShowAll] = useState(false);

  // The platform refuses a relationship whose two ends are the same principal.
  const notItself = useMemo(
    () => (entity === undefined ? undefined : new Set([entity.key])),
    [entity],
  );

  return (
    <div className="flex flex-col gap-3">
      {status === 'error' && <p className="text-error text-sm">{failedNotice}</p>}

      <Checkbox
        label={showAllLabel}
        checked={showAll}
        onCheckedChange={(checked) => setShowAll(checked === true)}
      />

      <PrincipalPicker
        kinds={['user', 'group']}
        idProvider={showAll ? undefined : form.idProvider}
        showIdProvider
        placeholder={membersPlaceholder}
        selected={form.members}
        excluded={notItself}
        onChange={(members) => updateGroupEditorForm({ members })}
      />
    </div>
  );
}
