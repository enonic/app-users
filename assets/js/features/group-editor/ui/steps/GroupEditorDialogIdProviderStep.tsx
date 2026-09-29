import { Selector } from '@enonic/ui';
import { useStore } from '@nanostores/preact';

import { useIdProviderNames } from '../../../../entities/principal';
import { visitedErrors } from '../../../../shared/form';
import { i18n, useI18n } from '../../../../shared/i18n';
import { FieldLabel } from '../../../../shared/ui/FieldLabel';
import { SelectorPopup } from '../../../../shared/ui/SelectorPopup';
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

  const providerName =
    providers.find(({ key }) => key === form.idProvider)?.displayName ?? form.idProvider;

  // Labels
  const providerLabel = useI18n('groups.dialog.idProvider');
  const providerPlaceholder = useI18n('groups.dialog.idProviderPlaceholder');

  // Errors
  const shown = visitedErrors(errors, visited);
  const providerError = shown.idProvider === undefined ? undefined : i18n(shown.idProvider);

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel id={PROVIDER_LABEL_ID} text={providerLabel} required />
      <Selector.Root
        value={form.idProvider}
        error={providerError !== undefined}
        onValueChange={(next) => {
          markGroupEditorFieldVisited('idProvider');
          setGroupEditorIdProvider(next);
        }}
      >
        <Selector.Trigger aria-labelledby={PROVIDER_LABEL_ID}>
          <Selector.Value placeholder={providerPlaceholder}>
            {form.idProvider.length > 0 ? providerName : undefined}
          </Selector.Value>
          <Selector.Icon />
        </Selector.Trigger>
        <SelectorPopup>
          {providers.map(({ key, displayName }) => (
            <Selector.Item key={key} value={key} textValue={displayName}>
              <Selector.ItemText>{displayName}</Selector.ItemText>
            </Selector.Item>
          ))}
        </SelectorPopup>
      </Selector.Root>
      {providerError !== undefined && <p className="text-error text-sm">{providerError}</p>}
    </div>
  );
}
