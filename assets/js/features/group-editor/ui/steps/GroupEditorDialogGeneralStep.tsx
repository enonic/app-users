import { Input, TextArea } from '@enonic/ui';
import { useStore } from '@nanostores/preact';

import { useIdProviderNames } from '../../../../entities/principal';
import { visitedErrors } from '../../../../shared/form';
import { i18n, useI18n } from '../../../../shared/i18n';
import { FieldLabel } from '../../../../shared/ui/FieldLabel';
import {
  $groupEditor,
  $groupEditorErrors,
  groupNameCheck,
  markGroupEditorFieldVisited,
  setGroupEditorDisplayName,
  setGroupEditorName,
  updateGroupEditorForm,
} from '../../model/group-editor.store';

const DISPLAY_NAME_ID = 'group-editor-display-name';
const ID_FIELD_ID = 'group-editor-id';
const DESCRIPTION_ID = 'group-editor-description';

export function GroupEditorDialogGeneralStep() {
  const { form, visited, mode } = useStore($groupEditor, { keys: ['form', 'visited', 'mode'] });
  const errors = useStore($groupEditorErrors);
  const idCheck = useStore(groupNameCheck.$state);
  const { items: providers } = useIdProviderNames();

  const persisted = mode === 'edit';

  const providerName =
    providers.find(({ key }) => key === form.idProvider)?.displayName ?? form.idProvider;

  // Labels
  const displayNameLabel = useI18n('groups.dialog.displayName');
  const idLabel = useI18n('groups.dialog.id');
  const idHelp = useI18n('groups.dialog.idHelp');
  const descriptionLabel = useI18n('groups.dialog.description');

  // Errors
  const shown = visitedErrors(errors, visited);
  const displayNameError = shown.displayName === undefined ? undefined : i18n(shown.displayName);
  const idErrorKey = idCheck.status === 'taken' ? errors.name : shown.name;
  const idError = idErrorKey === undefined ? undefined : i18n(idErrorKey, form.name, providerName);

  return (
    <div className="flex flex-col gap-5">
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

      {/* ID */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel text={idLabel} required={!persisted} htmlFor={ID_FIELD_ID} />
        <Input
          id={ID_FIELD_ID}
          disabled={persisted}
          value={form.name}
          description={persisted ? undefined : idHelp}
          error={idError}
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
