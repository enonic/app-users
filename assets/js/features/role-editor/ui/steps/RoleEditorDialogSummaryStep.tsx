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

  const usersLabel = useI18n('roles.dialog.users');
  const groupsLabel = useI18n('roles.dialog.groups');

  return (
    <StepDialogSummary>
      {roleSummaryRows(form).map(({ labelKey, value }) => (
        <StepDialogSummaryRow key={labelKey} label={i18n(labelKey)}>
          <span className="break-words">{value}</span>
        </StepDialogSummaryRow>
      ))}

      <PrincipalsSummaryRow
        label={usersLabel}
        principals={form.members.filter(({ type }) => type === 'user')}
      />
      <PrincipalsSummaryRow
        label={groupsLabel}
        principals={form.members.filter(({ type }) => type === 'group')}
      />
    </StepDialogSummary>
  );
}
