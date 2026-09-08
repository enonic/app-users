import { useStore } from '@nanostores/preact';

import { PrincipalsSummaryRow } from '../../../../entities/principal/ui/PrincipalsSummaryRow';
import { i18n, useI18n } from '../../../../shared/i18n';
import {
  StepDialogSummary,
  StepDialogSummaryRow,
} from '../../../../shared/step-dialog/StepDialogSummary';
import { $roleEditor } from '../../model/role-editor.store';
import { roleSummaryRows } from '../../model/role-summary';

export function RoleEditorDialogSummaryStep() {
  const { form } = useStore($roleEditor, { keys: ['form'] });

  const membersLabel = useI18n('roles.dialog.members');

  return (
    <StepDialogSummary>
      {roleSummaryRows(form).map(({ labelKey, value }) => (
        <StepDialogSummaryRow key={labelKey} label={i18n(labelKey)}>
          <span className="break-words">{value}</span>
        </StepDialogSummaryRow>
      ))}

      <PrincipalsSummaryRow label={membersLabel} principals={form.members} />
    </StepDialogSummary>
  );
}
