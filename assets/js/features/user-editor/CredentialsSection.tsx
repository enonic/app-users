import { Button, GridList, IconButton, Input } from '@enonic/ui';
import { Eye, EyeOff, Plus, X } from 'lucide-react';
import { useState } from 'preact/hooks';

import type { PublicKey } from '../../entities/principal';
import { i18n, useI18n } from '../../shared/i18n';
import { ConfirmDialog } from '../../shared/ui/dialogs/ConfirmDialog';
import { FieldLabel } from '../../shared/ui/FieldLabel';
import { PasswordStrengthMeter } from '../../shared/ui/PasswordStrengthMeter';
import { AddPublicKeyDialog, type AddOutcome } from './AddPublicKeyDialog';
import type { KeyPair } from './model/key-pair';
import { generatePassword, passwordStrength } from './model/password-strength';
import type { PasswordAction } from './model/user-form';
import { PublicKeyCard } from './PublicKeyCard';
import { ShowPublicKeyDialog } from './ShowPublicKeyDialog';

export type CredentialsSectionProps = {
  action: PasswordAction;
  clearable: boolean;
  cleared: boolean;
  publicKeys: boolean;
  keys: readonly PublicKey[];
  persisted: boolean;
  password?: string;
  error?: string;
  onPasswordChange: (password: string | undefined) => void;
  onClearedChange: (cleared: boolean) => void;
  onAddKey: (publicKey: string, label?: string) => Promise<AddOutcome>;
  onRemoveKey: (kid: string) => Promise<string | undefined>;
  onKeyGenerated: (pair: KeyPair, stored: PublicKey) => void;
  onBlur: () => void;
};

const PASSWORD_ID = 'user-password';

export function CredentialsSection({
  action,
  clearable,
  cleared,
  publicKeys,
  keys,
  persisted,
  password,
  error,
  onPasswordChange,
  onClearedChange,
  onAddKey,
  onRemoveKey,
  onKeyGenerated,
  onBlur,
}: CredentialsSectionProps) {
  const passwordLabel = useI18n('users.dialog.password');
  const setPasswordLabel = useI18n('users.dialog.setPassword');
  const changePasswordLabel = useI18n('users.dialog.changePassword');
  const clearPasswordLabel = useI18n('users.dialog.clearPassword');
  const clearQuestion = useI18n('users.dialog.clearPasswordQuestion');
  const clearedNotice = useI18n('users.dialog.passwordWillClear');
  const optionalNotice = useI18n('users.dialog.passwordOptional');
  const keepLabel = useI18n('users.dialog.keepPassword');
  const generateLabel = useI18n('users.dialog.generatePassword');
  const showLabel = useI18n('users.dialog.showPassword');
  const hideLabel = useI18n('users.dialog.hidePassword');
  const discardLabel = useI18n('users.dialog.discardPassword');
  const keysLabel = useI18n('users.dialog.publicKeys');
  const keysHelp = useI18n('users.dialog.publicKeysHelp');
  const addKeyLabel = useI18n('users.dialog.addPublicKey');
  const noKeysLabel = useI18n('users.dialog.noPublicKeys');
  const removeKeyLabel = (key: PublicKey): string =>
    i18n('users.dialog.removePublicKey', key.label ?? key.kid);
  const revokeQuestion = useI18n('browse.confirm.deleteQuestion');

  const [shown, setShown] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [revoking, setRevoking] = useState<PublicKey | undefined>();
  const [showing, setShowing] = useState<PublicKey | undefined>();
  const [revokeFailure, setRevokeFailure] = useState<string | undefined>();

  const strength = passwordStrength(password ?? '');
  const strengthLabel = useI18n(strength.labelKey);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <FieldLabel
          text={passwordLabel}
          htmlFor={password === undefined ? undefined : PASSWORD_ID}
        />

        {password === undefined && cleared ? (
          <div className="flex items-center gap-3 self-start">
            <p className="text-subtle text-sm">{clearedNotice}</p>
            <Button
              variant="outline"
              size="sm"
              label={keepLabel}
              onClick={() => onClearedChange(false)}
            />
          </div>
        ) : password === undefined ? (
          <div className="flex flex-col items-start gap-1.5">
            <div className="flex gap-2">
              <Button
                variant="filled"
                size="sm"
                label={action === 'set' ? setPasswordLabel : changePasswordLabel}
                onClick={() => onPasswordChange('')}
              />
              {clearable && (
                <Button
                  variant="filled"
                  size="sm"
                  label={clearPasswordLabel}
                  onClick={() => setClearing(true)}
                />
              )}
            </div>
            {action === 'set' && <p className="text-subtle text-sm">{optionalNotice}</p>}
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <div className="flex w-full max-w-md flex-col gap-3">
              <Input
                id={PASSWORD_ID}
                type={shown ? 'text' : 'password'}
                autocomplete="new-password"
                value={password}
                error={error}
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
                onInput={({ currentTarget }) => onPasswordChange(currentTarget.value)}
                onBlur={onBlur}
              />

              <PasswordStrengthMeter score={strength.score} label={strengthLabel} />
            </div>

            <div className="flex h-12 shrink-0 items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                label={generateLabel}
                onClick={() => onPasswordChange(generatePassword())}
              />

              <IconButton
                aria-label={discardLabel}
                icon={X}
                iconSize={20}
                size="md"
                variant="text"
                onClick={() => {
                  setShown(false);
                  onPasswordChange(undefined);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {publicKeys && (
        <div className="flex flex-col gap-1.5">
          <FieldLabel text={keysLabel} />

          {persisted ? (
            <>
              {keys.length === 0 ? (
                <p className="text-subtle text-sm">{noKeysLabel}</p>
              ) : (
                <GridList className="flex w-full flex-col gap-2.5 rounded-md py-1.5 pr-1 pl-1">
                  {keys.map((key) => (
                    <GridList.Row key={key.kid} id={`${key.kid}-key`} className="gap-2.5 p-1">
                      {/* ! `min-w-0` is what lets the card truncate: the cell is a flex child and sits
                          ! at `min-width: auto`, so without it the card's full width wins and the
                          ! remove button is pushed out of the row. */}
                      <GridList.Cell className="min-w-0 flex-1 self-stretch">
                        <PublicKeyCard publicKey={key} onShow={() => setShowing(key)} />
                      </GridList.Cell>
                      <GridList.Cell className="shrink-0">
                        <GridList.Action>
                          <IconButton
                            aria-label={removeKeyLabel(key)}
                            icon={X}
                            variant="text"
                            onClick={() => setRevoking(key)}
                          />
                        </GridList.Action>
                      </GridList.Cell>
                    </GridList.Row>
                  ))}
                </GridList>
              )}

              <Button
                variant="outline"
                size="sm"
                endIcon={Plus}
                label={addKeyLabel}
                onClick={() => setAdding(true)}
              />
            </>
          ) : (
            <p className="text-subtle text-sm">{keysHelp}</p>
          )}
        </div>
      )}

      <ConfirmDialog
        open={clearing}
        question={clearQuestion}
        onConfirm={() => {
          onClearedChange(true);
          setClearing(false);
        }}
        onClose={() => setClearing(false)}
      />

      <ConfirmDialog
        open={revoking !== undefined}
        question={revokeQuestion}
        error={revokeFailure}
        onConfirm={() => {
          const target = revoking;
          if (target === undefined) {
            return;
          }

          void onRemoveKey(target.kid).then((error) => {
            setRevokeFailure(error);
            if (error === undefined) {
              setRevoking(undefined);
            }
          });
        }}
        onClose={() => {
          setRevoking(undefined);
          setRevokeFailure(undefined);
        }}
      >
        {revoking !== undefined && (
          <div className="py-1.5">
            <PublicKeyCard publicKey={revoking} detailed />
          </div>
        )}
      </ConfirmDialog>

      <ShowPublicKeyDialog publicKey={showing} onClose={() => setShowing(undefined)} />

      <AddPublicKeyDialog
        open={adding}
        onAdd={onAddKey}
        onGenerated={onKeyGenerated}
        onClose={() => setAdding(false)}
      />
    </div>
  );
}
