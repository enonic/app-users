import { GridList, IconButton, Input, Selector, TextArea } from '@enonic/ui';
import { useStore } from '@nanostores/preact';
import { Pencil, X } from 'lucide-react';
import { useState } from 'preact/hooks';

import { ApplicationIcon } from '../../../../entities/application';
import { visitedErrors } from '../../../../shared/form';
import { i18n, useI18n } from '../../../../shared/i18n';
import { FieldLabel } from '../../../../shared/ui/FieldLabel';
import { ItemLabel } from '../../../../shared/ui/ItemLabel';
import { SelectorPopup } from '../../../../shared/ui/SelectorPopup';
import { $idProviderApplications } from '../../model/idprovider-applications';
import {
  $idProviderEditor,
  $idProviderEditorErrors,
  idProviderNameCheck,
  markIdProviderEditorFieldVisited,
  setIdProviderEditorDisplayName,
  setIdProviderEditorName,
  updateIdProviderEditorForm,
} from '../../model/idprovider-editor.store';
import { isSystemIdProvider } from '../../model/idprovider-form';
import { ConfigDialog } from '../ConfigDialog';

const DISPLAY_NAME_ID = 'id-provider-editor-display-name';
const NAME_ID = 'id-provider-editor-name';
const DESCRIPTION_ID = 'id-provider-editor-description';
const APPLICATION_LABEL_ID = 'id-provider-editor-application-label';

export function IdProviderEditorDialogGeneralStep() {
  const { form, visited, mode, entity } = useStore($idProviderEditor, {
    keys: ['form', 'visited', 'mode', 'entity'],
  });
  const errors = useStore($idProviderEditorErrors);
  const nameCheck = useStore(idProviderNameCheck.$state);
  const applications = useStore($idProviderApplications);

  const persisted = mode === 'edit';
  // The system provider answers to the platform's own login and may not be bound elsewhere.
  const applicationFixed = persisted && entity !== undefined && isSystemIdProvider(entity.key);

  const [configuring, setConfiguring] = useState(false);

  const selected = applications.find(({ key }) => key === form.application);

  // Labels
  const displayNameLabel = useI18n('idProviders.dialog.displayName');
  const nameLabel = useI18n('idProviders.dialog.name');
  const descriptionLabel = useI18n('idProviders.dialog.description');
  const applicationLabel = useI18n('idProviders.dialog.application');
  const applicationPlaceholder = useI18n('idProviders.dialog.applicationPlaceholder');
  const configLabel = useI18n('idProviders.dialog.editConfig');
  const clearApplicationLabel = useI18n('idProviders.dialog.clearApplication');

  // Errors
  const shown = visitedErrors(errors, visited);
  const displayNameError = shown.displayName === undefined ? undefined : i18n(shown.displayName);
  // A taken name is told at once: the answer arrives after the field was typed in, visited or not.
  const nameErrorKey = nameCheck.status === 'taken' ? errors.name : shown.name;
  const nameError = nameErrorKey === undefined ? undefined : i18n(nameErrorKey, form.name);

  return (
    <div className="flex flex-col gap-5">
      {/* Display name */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel text={displayNameLabel} required htmlFor={DISPLAY_NAME_ID} />
        <Input
          id={DISPLAY_NAME_ID}
          value={form.displayName}
          error={displayNameError}
          onInput={({ currentTarget }) => setIdProviderEditorDisplayName(currentTarget.value)}
          onBlur={() => markIdProviderEditorFieldVisited('displayName')}
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
          onInput={({ currentTarget }) => setIdProviderEditorName(currentTarget.value)}
          onBlur={() => {
            markIdProviderEditorFieldVisited('name');
            setIdProviderEditorName(form.name, { immediate: true });
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
            updateIdProviderEditorForm({ description: currentTarget.value })
          }
        />
      </div>

      {/* Application */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel id={APPLICATION_LABEL_ID} text={applicationLabel} />

        {/* Value fixed at empty, so the trigger reads as "pick one" and never repeats what the row
            below already says — the same division `PrincipalPicker` draws between its input and its
            picked rows. Choosing again replaces the binding in one click. */}
        <Selector.Root
          value=""
          disabled={applicationFixed}
          onValueChange={(application) => updateIdProviderEditorForm({ application })}
        >
          <Selector.Trigger aria-labelledby={APPLICATION_LABEL_ID}>
            <Selector.Value placeholder={applicationPlaceholder} />
            <Selector.Icon />
          </Selector.Trigger>
          <SelectorPopup>
            {applications.map(({ key, displayName }) => (
              <Selector.Item key={key} value={key} textValue={displayName}>
                <Selector.ItemText>{displayName}</Selector.ItemText>
              </Selector.Item>
            ))}
          </SelectorPopup>
        </Selector.Root>

        {form.application !== '' && (
          <GridList
            labelledBy={APPLICATION_LABEL_ID}
            className="flex flex-col gap-2.5 rounded-md py-1.5 pr-1 pl-1"
          >
            <GridList.Row id={`${form.application}-bound`} className="gap-2.5 p-1">
              <GridList.Cell interactive={false} className="flex-1 self-stretch">
                <ItemLabel
                  className="min-w-0 flex-1"
                  icon={<ApplicationIcon />}
                  primary={selected?.displayName ?? form.application}
                  secondary={selected === undefined ? undefined : form.application}
                />
              </GridList.Cell>

              {selected?.hasConfig === true && (
                <GridList.Cell>
                  <GridList.Action>
                    <IconButton
                      aria-label={configLabel}
                      icon={Pencil}
                      variant="text"
                      onClick={() => setConfiguring(true)}
                    />
                  </GridList.Action>
                </GridList.Cell>
              )}

              <GridList.Cell>
                <GridList.Action>
                  <IconButton
                    aria-label={clearApplicationLabel}
                    icon={X}
                    variant="text"
                    disabled={applicationFixed}
                    onClick={() => updateIdProviderEditorForm({ application: '' })}
                  />
                </GridList.Action>
              </GridList.Cell>
            </GridList.Row>
          </GridList>
        )}
      </div>

      <ConfigDialog
        open={configuring}
        application={selected?.displayName ?? form.application}
        onClose={() => setConfiguring(false)}
      />
    </div>
  );
}
