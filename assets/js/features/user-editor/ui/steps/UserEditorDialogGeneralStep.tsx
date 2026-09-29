import { Input } from '@enonic/ui';
import { useStore } from '@nanostores/preact';

import { visitedErrors } from '../../../../shared/form';
import { i18n, useI18n } from '../../../../shared/i18n';
import { FieldLabel } from '../../../../shared/ui/FieldLabel';
import {
  $userEditor,
  $userEditorErrors,
  $userEditorProviders,
  $userEditorServiceAccount,
  $userEditorSystemUser,
  markUserEditorFieldVisited,
  setUserEditorDisplayName,
  setUserEditorEmail,
  setUserEditorName,
  userEmailCheck,
  userNameCheck,
} from '../../model/user-editor.store';

const PROVIDER_ID = 'user-editor-id-provider';
const DISPLAY_NAME_ID = 'user-editor-display-name';
const ID_FIELD_ID = 'user-editor-id';
const EMAIL_ID = 'user-editor-email';

export function UserEditorDialogGeneralStep() {
  const { form, visited, mode } = useStore($userEditor, { keys: ['form', 'visited', 'mode'] });
  const errors = useStore($userEditorErrors);
  const systemUser = useStore($userEditorSystemUser);
  const serviceAccount = useStore($userEditorServiceAccount);
  const idCheck = useStore(userNameCheck.$state);
  const emailCheck = useStore(userEmailCheck.$state);
  const providers = useStore($userEditorProviders);

  const persisted = mode === 'edit';

  const providerName =
    providers.find(({ key }) => key === form.idProvider)?.displayName ?? form.idProvider;

  // Labels
  const providerLabel = useI18n('users.dialog.idProvider');
  const displayNameLabel = useI18n('users.dialog.displayName');
  const idLabel = useI18n('users.dialog.id');
  const idHelp = useI18n('users.dialog.idHelp');
  const emailLabel = useI18n('users.dialog.email');

  // Errors
  const shown = visitedErrors(errors, visited);
  const displayNameError = shown.displayName === undefined ? undefined : i18n(shown.displayName);
  const idErrorKey = idCheck.status === 'taken' ? errors.name : shown.name;
  const idError = idErrorKey === undefined ? undefined : i18n(idErrorKey, form.name, providerName);
  const emailErrorKey = emailCheck.status === 'taken' ? errors.email : shown.email;
  const emailError =
    emailErrorKey === undefined ? undefined : i18n(emailErrorKey, form.email, providerName);

  return (
    <div className="flex flex-col gap-5">
      {/* ID provider — chosen on create's own step; a service account's goes without saying. */}
      {persisted && !serviceAccount && (
        <div className="flex flex-col gap-1.5">
          <FieldLabel text={providerLabel} htmlFor={PROVIDER_ID} />
          <Input id={PROVIDER_ID} disabled value={providerName} />
        </div>
      )}

      {/* Display Name input */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel text={displayNameLabel} required htmlFor={DISPLAY_NAME_ID} />
        <Input
          id={DISPLAY_NAME_ID}
          value={form.displayName}
          error={displayNameError}
          onInput={({ currentTarget }) => setUserEditorDisplayName(currentTarget.value)}
          onBlur={() => markUserEditorFieldVisited('displayName')}
        />
      </div>

      {/* ID input */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel text={idLabel} required={!persisted} htmlFor={ID_FIELD_ID} />
        <Input
          id={ID_FIELD_ID}
          disabled={persisted}
          value={form.name}
          description={persisted ? undefined : idHelp}
          error={idError}
          onInput={({ currentTarget }) => setUserEditorName(currentTarget.value)}
          onBlur={() => {
            markUserEditorFieldVisited('name');
            setUserEditorName(form.name, { immediate: true });
          }}
        />
      </div>

      {/* Email input — `su` and `anonymous` have none, and `validateUserForm` asks them for none. */}
      {!systemUser && (
        <div className="flex flex-col gap-1.5">
          <FieldLabel text={emailLabel} required htmlFor={EMAIL_ID} />
          <Input
            id={EMAIL_ID}
            type="email"
            value={form.email}
            error={emailError}
            onInput={({ currentTarget }) => setUserEditorEmail(currentTarget.value)}
            onBlur={() => {
              markUserEditorFieldVisited('email');
              setUserEditorEmail(form.email, { immediate: true });
            }}
          />
        </div>
      )}
    </div>
  );
}
