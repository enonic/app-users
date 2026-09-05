import { Input, Selector } from '@enonic/ui';
import { useStore } from '@nanostores/preact';

import { useIdProviderNames } from '../../../../entities/principal';
import { visitedErrors } from '../../../../shared/form';
import { i18n, useI18n } from '../../../../shared/i18n';
import { FieldLabel } from '../../../../shared/ui/FieldLabel';
import { SelectorPopup } from '../../../../shared/ui/SelectorPopup';
import {
  $userEditor,
  $userEditorErrors,
  $userEditorSystemUser,
  markUserEditorFieldVisited,
  setUserEditorDisplayName,
  setUserEditorIdProvider,
  setUserEditorName,
  updateUserEditorForm,
} from '../../model/user-editor.store';
import { $userNameCheck } from '../../model/user-name-check.store';

const PROVIDER_LABEL_ID = 'user-editor-id-provider-label';
const DISPLAY_NAME_ID = 'user-editor-display-name';
const NAME_ID = 'user-editor-name';
const EMAIL_ID = 'user-editor-email';

export function UserEditorDialogIdentityStep() {
  const { form, visited, mode } = useStore($userEditor, { keys: ['form', 'visited', 'mode'] });
  const errors = useStore($userEditorErrors);
  const systemUser = useStore($userEditorSystemUser);
  const nameCheck = useStore($userNameCheck);
  const { items: providers } = useIdProviderNames();

  const persisted = mode === 'edit';

  const providerName =
    providers.find(({ key }) => key === form.idProvider)?.displayName ?? form.idProvider;

  // Labels
  const providerLabel = useI18n('users.dialog.idProvider');
  const providerPlaceholder = useI18n('users.dialog.idProviderPlaceholder');
  const displayNameLabel = useI18n('users.dialog.displayName');
  const displayNamePlaceholder = useI18n('users.dialog.displayNamePlaceholder');
  const nameLabel = useI18n('users.dialog.name');
  const emailLabel = useI18n('users.dialog.email');

  // Errors
  const shown = visitedErrors(errors, visited);
  const providerError = shown.idProvider === undefined ? undefined : i18n(shown.idProvider);
  const displayNameError = shown.displayName === undefined ? undefined : i18n(shown.displayName);
  // ! A taken name shows whether or not the field was ever entered: the display name fills it in, so a
  // ! user who tabs from there to Email would otherwise face a dead `Next` with nothing explaining it.
  const nameErrorKey = nameCheck.status === 'taken' ? errors.name : shown.name;
  // The name's phrases are the only ones that name what they are about; the rest ignore the values.
  const nameError =
    nameErrorKey === undefined ? undefined : i18n(nameErrorKey, form.name, providerName);
  const emailError = shown.email === undefined ? undefined : i18n(shown.email);

  return (
    <div className="flex flex-col gap-5">
      {/* IdProvider Selector */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel id={PROVIDER_LABEL_ID} text={providerLabel} required={!persisted} />
        <Selector.Root
          disabled={persisted}
          value={form.idProvider}
          error={providerError !== undefined}
          onValueChange={(next) => {
            markUserEditorFieldVisited('idProvider');
            setUserEditorIdProvider(next);
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

      {/* Display Name input */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel text={displayNameLabel} required htmlFor={DISPLAY_NAME_ID} />
        <Input
          id={DISPLAY_NAME_ID}
          value={form.displayName}
          placeholder={displayNamePlaceholder}
          error={displayNameError}
          onInput={({ currentTarget }) => setUserEditorDisplayName(currentTarget.value)}
          onBlur={() => markUserEditorFieldVisited('displayName')}
        />
      </div>

      {/* Name input */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel text={nameLabel} required={!persisted} htmlFor={NAME_ID} />
        <Input
          id={NAME_ID}
          disabled={persisted}
          value={form.name}
          error={nameError}
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
            onInput={({ currentTarget }) => updateUserEditorForm({ email: currentTarget.value })}
            onBlur={() => markUserEditorFieldVisited('email')}
          />
        </div>
      )}
    </div>
  );
}
