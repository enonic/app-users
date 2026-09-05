import { Button, Dialog, IconButton, Input } from '@enonic/ui';
import { useStore } from '@nanostores/preact';
import { Eye, EyeOff, X } from 'lucide-react';
import { useState } from 'preact/hooks';

import { visitedErrors } from '../../../../shared/form';
import { i18n, useI18n } from '../../../../shared/i18n';
import { FieldLabel } from '../../../../shared/ui/FieldLabel';
import { PasswordStrengthMeter } from '../../../../shared/ui/PasswordStrengthMeter';
import { generatePassword, passwordStrength } from '../../model/password-strength';
import { $userEditDetail } from '../../model/user-edit-detail';
import { USER_EDITOR_STEPS } from '../../model/user-editor-steps';
import {
  $userEditor,
  $userEditorErrors,
  $userEditorStepLocks,
  clearUserEditorPassword,
  markUserEditorFieldVisited,
  setUserEditorPassword,
} from '../../model/user-editor.store';
import { passwordActions, showsPublicKeys } from '../../model/user-form';
import { PublicKeysSection } from '../PublicKeysSection';

const STEP = USER_EDITOR_STEPS.credentials;

const PASSWORD_ID = 'user-editor-password';

export function UserEditorDialogCredentialStep() {
  const { form, visited, user } = useStore($userEditor, { keys: ['form', 'visited', 'user'] });
  const errors = useStore($userEditorErrors);
  const locks = useStore($userEditorStepLocks);
  const detail = useStore($userEditDetail);

  const [shown, setShown] = useState(false);

  const { password, clearPassword } = form;
  const stored = detail.item?.key === user?.key ? (detail.item?.publicKeys ?? []) : [];
  const { action, clearable } = passwordActions(user?.hasPassword === true);
  const strength = passwordStrength(password ?? '');
  const strengthLabel = useI18n(strength.labelKey);

  // Labels
  const passwordLabel = useI18n('users.dialog.password');
  const setPasswordLabel = useI18n('users.dialog.setPassword');
  const changePasswordLabel = useI18n('users.dialog.changePassword');
  const clearPasswordLabel = useI18n('users.dialog.clearPassword');
  const clearedNotice = useI18n('users.dialog.passwordWillClear');
  const keepLabel = useI18n('users.dialog.keepPassword');
  const optionalNotice = useI18n('users.dialog.passwordOptional');
  const alreadySetNotice = useI18n('users.dialog.passwordAlreadySet');
  const generateLabel = useI18n('users.dialog.generatePassword');
  const showLabel = useI18n('users.dialog.showPassword');
  const hideLabel = useI18n('users.dialog.hidePassword');
  const discardLabel = useI18n('users.dialog.discardPassword');

  // Errors
  const shownErrors = visitedErrors(errors, visited);
  const passwordError = shownErrors.password === undefined ? undefined : i18n(shownErrors.password);

  return (
    <Dialog.StepContent step={STEP} locked={locks[STEP]}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex min-h-8 items-center justify-between gap-4">
            <FieldLabel
              text={passwordLabel}
              htmlFor={password === undefined ? undefined : PASSWORD_ID}
            />

            {password === undefined && clearPassword !== true && (
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  label={action === 'set' ? setPasswordLabel : changePasswordLabel}
                  onClick={() => setUserEditorPassword('')}
                />
                {clearable && (
                  <Button
                    variant="outline"
                    size="sm"
                    label={clearPasswordLabel}
                    onClick={() => {
                      setShown(false);
                      clearUserEditorPassword(true);
                    }}
                  />
                )}
              </div>
            )}
          </div>

          {password === undefined && clearPassword === true ? (
            <div className="flex items-center gap-3 self-start">
              <p className="text-subtle text-sm">{clearedNotice}</p>
              <Button
                variant="outline"
                size="sm"
                label={keepLabel}
                onClick={() => clearUserEditorPassword(false)}
              />
            </div>
          ) : password === undefined ? (
            <p className="text-subtle text-sm">{clearable ? alreadySetNotice : optionalNotice}</p>
          ) : (
            <div className="flex items-start gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <Input
                  id={PASSWORD_ID}
                  type={shown ? 'text' : 'password'}
                  autocomplete="new-password"
                  value={password}
                  error={passwordError}
                  endAddon={
                    <IconButton
                      aria-label={shown ? hideLabel : showLabel}
                      className="mr-1 shrink-0 self-center"
                      icon={shown ? EyeOff : Eye}
                      iconSize={18}
                      size="sm"
                      variant="text"
                      onClick={() => setShown((current) => !current)}
                    />
                  }
                  onInput={({ currentTarget }) => setUserEditorPassword(currentTarget.value)}
                  onBlur={() => markUserEditorFieldVisited('password')}
                />

                <PasswordStrengthMeter score={strength.score} label={strengthLabel} />
              </div>

              <div className="flex h-12 shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  label={generateLabel}
                  onClick={() => setUserEditorPassword(generatePassword())}
                />

                <IconButton
                  aria-label={discardLabel}
                  icon={X}
                  iconSize={20}
                  size="md"
                  variant="text"
                  onClick={() => {
                    setShown(false);
                    setUserEditorPassword(undefined);
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {showsPublicKeys(form) && <PublicKeysSection form={form} stored={stored} />}
      </div>
    </Dialog.StepContent>
  );
}
