import { Input, Selector, TextArea } from '@enonic/ui';
import { useStore } from '@nanostores/preact';

import { useIdProviderNames } from '../../../../entities/principal';
import { visitedErrors } from '../../../../shared/form';
import { i18n, useI18n } from '../../../../shared/i18n';
import { FieldLabel } from '../../../../shared/ui/FieldLabel';
import { SelectorPopup } from '../../../../shared/ui/SelectorPopup';
import {
  $groupEditor,
  $groupEditorErrors,
  groupNameCheck,
  markGroupEditorFieldVisited,
  setGroupEditorDisplayName,
  setGroupEditorIdProvider,
  setGroupEditorName,
  updateGroupEditorForm,
} from '../../model/group-editor.store';

const PROVIDER_LABEL_ID = 'group-editor-id-provider-label';
const DISPLAY_NAME_ID = 'group-editor-display-name';
const NAME_ID = 'group-editor-name';
const DESCRIPTION_ID = 'group-editor-description';

export function GroupEditorDialogGeneralStep() {
  const { form, visited, mode } = useStore($groupEditor, { keys: ['form', 'visited', 'mode'] });
  const errors = useStore($groupEditorErrors);
  const nameCheck = useStore(groupNameCheck.$state);
  const { items: providers } = useIdProviderNames();

  const persisted = mode === 'edit';

  const providerName =
    providers.find(({ key }) => key === form.idProvider)?.displayName ?? form.idProvider;

  // Labels
  const providerLabel = useI18n('groups.dialog.idProvider');
  const providerPlaceholder = useI18n('groups.dialog.idProviderPlaceholder');
  const displayNameLabel = useI18n('groups.dialog.displayName');
  const nameLabel = useI18n('groups.dialog.name');
  const descriptionLabel = useI18n('groups.dialog.description');

  // Errors
  const shown = visitedErrors(errors, visited);
  const providerError = shown.idProvider === undefined ? undefined : i18n(shown.idProvider);
  const displayNameError = shown.displayName === undefined ? undefined : i18n(shown.displayName);
  const nameErrorKey = nameCheck.status === 'taken' ? errors.name : shown.name;
  const nameError =
    nameErrorKey === undefined ? undefined : i18n(nameErrorKey, form.name, providerName);

  return (
    <div className="flex flex-col gap-5">
      {/* ID provider */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel id={PROVIDER_LABEL_ID} text={providerLabel} required={!persisted} />
        <Selector.Root
          disabled={persisted}
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

      {/* Display name */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel text={displayNameLabel} required htmlFor={DISPLAY_NAME_ID} />
        <Input
          id={DISPLAY_NAME_ID}
          value={form.displayName}
          error={displayNameError}
          onInput={({ currentTarget }) => setGroupEditorDisplayName(currentTarget.value)}
          onBlur={() => markGroupEditorFieldVisited('displayName')}
        />
      </div>

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel text={nameLabel} required={!persisted} htmlFor={NAME_ID} />
        <Input
          id={NAME_ID}
          disabled={persisted}
          value={form.name}
          error={nameError}
          onInput={({ currentTarget }) => setGroupEditorName(currentTarget.value)}
          onBlur={() => {
            markGroupEditorFieldVisited('name');
            setGroupEditorName(form.name, { immediate: true });
          }}
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel text={descriptionLabel} htmlFor={DESCRIPTION_ID} />
        <TextArea
          id={DESCRIPTION_ID}
          value={form.description}
          rows={3}
          onInput={({ currentTarget }) =>
            updateGroupEditorForm({ description: currentTarget.value })
          }
        />
      </div>
    </div>
  );
}
