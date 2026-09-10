import { useStore } from '@nanostores/preact';

import { PrincipalsSummaryRow } from '../../../../entities/principal/ui/PrincipalsSummaryRow';
import { i18n, useI18n, useLabelled } from '../../../../shared/i18n';
import {
  StepDialogSummary,
  StepDialogSummaryRow,
} from '../../../../shared/step-dialog/StepDialogSummary';
import { ID_PROVIDER_ACCESS_LEVELS } from '../../model/idprovider-access';
import { $idProviderApplications } from '../../model/idprovider-applications';
import { $idProviderEditor } from '../../model/idprovider-editor.store';
import { idProviderSummaryRows } from '../../model/idprovider-summary';

export function IdProviderEditorDialogSummaryStep() {
  const { form } = useStore($idProviderEditor, { keys: ['form'] });
  const applications = useStore($idProviderApplications);

  const permissionsLabel = useI18n('idProviders.dialog.permissions');

  const levels = useLabelled(ID_PROVIDER_ACCESS_LEVELS);

  const application =
    form.application === ''
      ? undefined
      : (applications.find(({ key }) => key === form.application)?.displayName ?? form.application);

  const accessLabelOf = (key: string): string | undefined => {
    const access = form.permissions.find((entry) => entry.principal.key === key)?.access;
    return levels.find((level) => level.value === access)?.label;
  };

  return (
    <StepDialogSummary>
      {idProviderSummaryRows(form, application).map(({ labelKey, value }) => (
        <StepDialogSummaryRow key={labelKey} label={i18n(labelKey)}>
          <span className="break-words">{value}</span>
        </StepDialogSummaryRow>
      ))}

      <PrincipalsSummaryRow
        label={permissionsLabel}
        principals={form.permissions.map(({ principal }) => principal)}
        trailing={({ key }) => accessLabelOf(key)}
      />
    </StepDialogSummary>
  );
}
