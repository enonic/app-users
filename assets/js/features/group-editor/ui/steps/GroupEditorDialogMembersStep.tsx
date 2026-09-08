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
    <>
      {status === 'error' && <p className="text-error mb-3 text-sm">{failedNotice}</p>}

      <div className="flex items-start gap-4">
        {/* ! `min-w-0`: the column is a flex child at `min-width: auto`, so without it a long member
            ! name widens the picker and pushes the checkbox out of the row. */}
        <div className="min-w-0 flex-1">
          <PrincipalPicker
            kinds={['user', 'group']}
            idProvider={showAll ? undefined : form.idProvider}
            placeholder={membersPlaceholder}
            selected={form.members}
            excluded={notItself}
            onChange={(members) => updateGroupEditorForm({ members })}
          />
        </div>

        {/* The height matches the combobox, so the checkbox sits beside the input rather than beside
            the picked list that grows under it. */}
        <div className="flex h-12 shrink-0 items-center">
          <Checkbox
            label={showAllLabel}
            checked={showAll}
            onCheckedChange={(checked) => setShowAll(checked === true)}
          />
        </div>
      </div>
    </>
  );
}
