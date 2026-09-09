import { useStore } from '@nanostores/preact';

import { useIdProviderNames } from '../../../../entities/principal';
import { PrincipalsSummaryRow } from '../../../../entities/principal/ui/PrincipalsSummaryRow';
import { i18n, useI18n } from '../../../../shared/i18n';
import {
  StepDialogSummary,
  StepDialogSummaryRow,
} from '../../../../shared/step-dialog/StepDialogSummary';
import { $userEditor } from '../../model/user-editor.store';
import { userSummaryRows } from '../../model/user-summary';

export function UserEditorDialogSummaryStep() {
  const { form, entity } = useStore($userEditor, { keys: ['form', 'entity'] });
  const { items: providers } = useIdProviderNames();

  const rolesLabel = useI18n('users.dialog.roles');
  const groupsLabel = useI18n('users.dialog.groups');

  const providerName =
    providers.find(({ key }) => key === form.idProvider)?.displayName ?? form.idProvider;

  return (
    <StepDialogSummary>
      {userSummaryRows(form, providerName, entity?.hasPassword === true).map((row) => (
        <StepDialogSummaryRow key={row.labelKey} label={i18n(row.labelKey)}>
          {row.lines === undefined ? (
            <span className="break-words">
              {row.valueKey === undefined
                ? row.value
                : i18n(row.valueKey, ...(row.valueArgs ?? []))}
            </span>
          ) : (
            <div className="flex flex-col gap-2">
              {row.lines.map(({ key, args = [] }) => (
                <span key={key} className="break-words">
                  {i18n(key, ...args)}
                </span>
              ))}
            </div>
          )}
        </StepDialogSummaryRow>
      ))}

      <PrincipalsSummaryRow label={rolesLabel} principals={form.roles} />
      <PrincipalsSummaryRow label={groupsLabel} principals={form.groups} />
    </StepDialogSummary>
  );
}
