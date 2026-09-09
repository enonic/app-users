import { Input, TextArea } from '@enonic/ui';
import { useStore } from '@nanostores/preact';

import { visitedErrors } from '../../../../shared/form';
import { i18n, useI18n } from '../../../../shared/i18n';
import { FieldLabel } from '../../../../shared/ui/FieldLabel';
import {
  $roleEditor,
  $roleEditorErrors,
  markRoleEditorFieldVisited,
  roleNameCheck,
  setRoleEditorDisplayName,
  setRoleEditorName,
  updateRoleEditorForm,
} from '../../model/role-editor.store';

const DISPLAY_NAME_ID = 'role-editor-display-name';
const NAME_ID = 'role-editor-name';
const DESCRIPTION_ID = 'role-editor-description';

export function RoleEditorDialogIdentityStep() {
  const { form, visited, mode } = useStore($roleEditor, { keys: ['form', 'visited', 'mode'] });
  const errors = useStore($roleEditorErrors);
  const nameCheck = useStore(roleNameCheck.$state);

  const persisted = mode === 'edit';

  // Labels
  const displayNameLabel = useI18n('roles.dialog.displayName');
  const nameLabel = useI18n('roles.dialog.name');
  const descriptionLabel = useI18n('roles.dialog.description');

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
          onInput={({ currentTarget }) => setRoleEditorDisplayName(currentTarget.value)}
          onBlur={() => markRoleEditorFieldVisited('displayName')}
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
          onInput={({ currentTarget }) => setRoleEditorName(currentTarget.value)}
          onBlur={() => {
            markRoleEditorFieldVisited('name');
            setRoleEditorName(form.name, { immediate: true });
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
            updateRoleEditorForm({ description: currentTarget.value })
          }
        />
      </div>
    </div>
  );
}
