import { useStore } from '@nanostores/preact';

import { useIdProviderNames } from '../../../../entities/principal';
import { PrincipalsSummaryRow } from '../../../../entities/principal/ui/PrincipalsSummaryRow';
import { i18n, useI18n } from '../../../../shared/i18n';
import {
  StepDialogSummary,
  StepDialogSummaryRow,
} from '../../../../shared/step-dialog/StepDialogSummary';
import { $groupEditor } from '../../model/group-editor.store';
import { groupSummaryRows } from '../../model/group-summary';

export function GroupEditorDialogSummaryStep() {
  const { form } = useStore($groupEditor, { keys: ['form'] });
  const { items: providers } = useIdProviderNames();

  const membersLabel = useI18n('groups.dialog.members');
  const rolesLabel = useI18n('groups.dialog.roles');

  const providerName =
    providers.find(({ key }) => key === form.idProvider)?.displayName ?? form.idProvider;

  return (
    <StepDialogSummary>
      {groupSummaryRows(form, providerName).map(({ labelKey, value }) => (
        <StepDialogSummaryRow key={labelKey} label={i18n(labelKey)}>
          <span className="break-words">{value}</span>
        </StepDialogSummaryRow>
      ))}

      <PrincipalsSummaryRow label={membersLabel} principals={form.members} />
      <PrincipalsSummaryRow label={rolesLabel} principals={form.roles} />
    </StepDialogSummary>
  );
}
