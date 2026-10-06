import { useStore } from '@nanostores/preact';

import { useIdProviderNames } from '../../../../entities/principal';
import { IdProviderSelector } from '../../../../entities/principal/ui/IdProviderSelector';
import { visitedErrors } from '../../../../shared/form';
import { i18n, useI18n } from '../../../../shared/i18n';
import { FieldLabel } from '../../../../shared/ui/FieldLabel';
import {
  $groupEditor,
  $groupEditorErrors,
  markGroupEditorFieldVisited,
  setGroupEditorIdProvider,
} from '../../model/group-editor.store';

const PROVIDER_LABEL_ID = 'group-editor-id-provider-label';

export function GroupEditorDialogIdProviderStep() {
  const { form, visited } = useStore($groupEditor, { keys: ['form', 'visited'] });
  const errors = useStore($groupEditorErrors);
  const { items: providers } = useIdProviderNames();

  // Labels
  const providerLabel = useI18n('groups.dialog.idProvider');
  const providerPlaceholder = useI18n('groups.dialog.idProviderPlaceholder');

  // Errors
  const shown = visitedErrors(errors, visited);
  const providerError = shown.idProvider === undefined ? undefined : i18n(shown.idProvider);

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel id={PROVIDER_LABEL_ID} text={providerLabel} required />
      <IdProviderSelector
        providers={providers}
        value={form.idProvider}
        onChange={(next) => {
          markGroupEditorFieldVisited('idProvider');
          setGroupEditorIdProvider(next);
        }}
        labelledBy={PROVIDER_LABEL_ID}
        placeholder={providerPlaceholder}
        error={providerError !== undefined}
      />
      {providerError !== undefined && <p className="text-error text-sm">{providerError}</p>}
    </div>
  );
}
