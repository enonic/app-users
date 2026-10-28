import { FilledOctagonAlert, GridList, IconButton, Input, TextArea, Tooltip } from '@enonic/ui';
import { useStore } from '@nanostores/preact';
import { Pencil, TriangleAlert, X } from 'lucide-react';
import { useMemo, useState } from 'preact/hooks';

import { ApplicationIcon } from '../../../../entities/application';
import { ApplicationSelector } from '../../../../entities/application/ui/ApplicationSelector';
import { visitedErrors } from '../../../../shared/form';
import { i18n, useI18n } from '../../../../shared/i18n';
import { FieldLabel } from '../../../../shared/ui/FieldLabel';
import { ItemLabel } from '../../../../shared/ui/ItemLabel';
import { $idProviderApplications } from '../../model/idprovider-applications';
import { idProviderConfigIssue } from '../../model/idprovider-config-issue';
import { $idProviderConfig } from '../../model/idprovider-config.store';
import {
  $idProviderEditor,
  $idProviderEditorErrors,
  idProviderNameCheck,
  markIdProviderEditorDisplayNameVisited,
  setIdProviderEditorDisplayName,
  setIdProviderEditorName,
  updateIdProviderEditorForm,
} from '../../model/idprovider-editor.store';
import { idProviderNameWarning, isSystemIdProvider } from '../../model/idprovider-form';
import { ConfigDialog } from '../ConfigDialog';

const DISPLAY_NAME_ID = 'id-provider-editor-display-name';
const ID_FIELD_ID = 'id-provider-editor-id';
const ID_WARNING_ID = 'id-provider-editor-id-warning';
const DESCRIPTION_ID = 'id-provider-editor-description';
const APPLICATION_LABEL_ID = 'id-provider-editor-application-label';

export function IdProviderEditorDialogGeneralStep() {
  const { form, visited, mode, entity } = useStore($idProviderEditor, {
    keys: ['form', 'visited', 'mode', 'entity'],
  });
  const errors = useStore($idProviderEditorErrors);
  const idCheck = useStore(idProviderNameCheck.$state);
  const applications = useStore($idProviderApplications);
  const configSession = useStore($idProviderConfig);

  const persisted = mode === 'edit';
  // The system provider answers to the platform's own login and may not be bound elsewhere.
  const applicationFixed = persisted && entity !== undefined && isSystemIdProvider(entity.key);

  const [configuring, setConfiguring] = useState(false);

  const selected = applications.find(({ key }) => key === form.application);

  // Labels
  const displayNameLabel = useI18n('idProviders.dialog.displayName');
  const idLabel = useI18n('idProviders.dialog.id');
  const idHelp = useI18n('idProviders.dialog.idHelp');
  const descriptionLabel = useI18n('idProviders.dialog.description');
  const applicationLabel = useI18n('idProviders.dialog.application');
  const applicationPlaceholder = useI18n('idProviders.dialog.applicationPlaceholder');
  const configLabel = useI18n('idProviders.dialog.editConfig');
  const clearApplicationLabel = useI18n('idProviders.dialog.clearApplication');

  // Told, never enforced: Save stays open, and the dialog is where the inputs themselves say what is missing.
  const configIssueKey = useMemo(
    () => idProviderConfigIssue(configSession, form.application, form.config),
    [configSession, form.application, form.config],
  );

  // Errors
  const shown = visitedErrors(errors, visited);
  const displayNameError = shown.displayName === undefined ? undefined : i18n(shown.displayName);
  // A taken ID is told at once: the answer arrives after the field was typed in, visited or not.
  const idErrorKey = idCheck.status === 'taken' ? errors.name : shown.name;
  const idError = idErrorKey === undefined ? undefined : i18n(idErrorKey, form.name.trim());
  // One message under the field at a time: an error outranks the warning.
  const idWarningKey = idError === undefined ? idProviderNameWarning(form, mode) : undefined;

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
          onBlur={markIdProviderEditorDisplayNameVisited}
        />
      </div>

      {/* ID */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel text={idLabel} required={!persisted} htmlFor={ID_FIELD_ID} />
        <Input
          id={ID_FIELD_ID}
          disabled={persisted}
          value={form.name}
          description={persisted ? undefined : idHelp}
          error={idError}
          onInput={({ currentTarget }) => setIdProviderEditorName(currentTarget.value)}
          aria-describedby={idWarningKey === undefined ? undefined : ID_WARNING_ID}
          onBlur={() => setIdProviderEditorName(form.name, { immediate: true })}
        />
        {idWarningKey !== undefined && (
          <div id={ID_WARNING_ID} className="text-warn mt-0.5 flex items-center gap-2 leading-5">
            <TriangleAlert size={16} aria-hidden className="shrink-0" />
            {i18n(idWarningKey)}
          </div>
        )}
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

        <ApplicationSelector
          applications={applications}
          value={form.application}
          onChange={(application) => updateIdProviderEditorForm({ application })}
          labelledBy={APPLICATION_LABEL_ID}
          placeholder={applicationPlaceholder}
          disabled={applicationFixed}
        />

        {form.application !== '' && (
          <GridList
            labelledBy={APPLICATION_LABEL_ID}
            className="flex flex-col gap-2.5 rounded-md py-1.5 pr-1 pl-1"
          >
            <GridList.Row id={`${form.application}-bound`} className="gap-2.5 p-1">
              <GridList.Cell interactive={false} className="flex-1 self-stretch">
                <ItemLabel
                  className="min-w-0 flex-1"
                  icon={<ApplicationIcon icon={selected?.icon} />}
                  primary={
                    <span className="inline-flex max-w-full items-center gap-1.5 align-top">
                      <span className="min-w-0 truncate">
                        {selected?.displayName ?? form.application}
                      </span>
                      {configIssueKey !== undefined && (
                        <ConfigIssueIcon label={i18n(configIssueKey)} />
                      )}
                    </span>
                  }
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
        application={form.application}
        applicationName={selected?.displayName ?? form.application}
        onClose={() => setConfiguring(false)}
      />
    </div>
  );
}

//
// * Internal
//

const TOOLTIP_DELAY = 300;

// ! `asChild`, as `IconBadge` has it: without it the trigger is a `div` with a tab stop of its own inside
// ! a grid-list cell.
function ConfigIssueIcon({ label }: { label: string }) {
  return (
    <Tooltip value={label} side="top" delay={TOOLTIP_DELAY} asChild>
      <span role="img" aria-label={label} className="text-error inline-flex shrink-0">
        <FilledOctagonAlert size={16} aria-hidden />
      </span>
    </Tooltip>
  );
}
