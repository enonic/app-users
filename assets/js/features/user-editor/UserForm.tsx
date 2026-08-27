import { Input, Selector } from '@enonic/ui';

import { IMPLICIT_ROLE_KEYS, type IdProviderName, type PublicKey } from '../../entities/principal';
import { PrincipalPicker } from '../../entities/principal/ui/PrincipalPicker';
import { i18n, useI18n } from '../../shared/i18n';
import { FieldLabel } from '../../shared/ui/FieldLabel';
import { FieldSection } from '../../shared/ui/FieldSection';
import { SelectorPopup } from '../../shared/ui/SelectorPopup';
import type { AddOutcome } from './AddPublicKeyDialog';
import { CredentialsSection } from './CredentialsSection';
import type { KeyPair } from './model/key-pair';
import {
  passwordActions,
  showsPublicKeys,
  type UserFormErrors,
  type UserFormField,
  type UserForm as UserFormValues,
} from './model/user-form';

export type UserFormProps = {
  values: UserFormValues;
  keys: readonly PublicKey[];
  errors: UserFormErrors;
  providers: readonly IdProviderName[];
  persisted: boolean;
  systemUser: boolean;
  hasPassword: boolean;
  onChange: (values: UserFormValues) => void;
  onAddKey: (publicKey: string, label?: string) => Promise<AddOutcome>;
  onRemoveKey: (kid: string) => Promise<string | undefined>;
  onKeyGenerated: (pair: KeyPair, stored: PublicKey) => void;
  onBlur: (field: UserFormField) => void;
};

const PROVIDER_LABEL_ID = 'user-id-provider-label';
const NAME_ID = 'user-name';
const EMAIL_ID = 'user-email';

export function UserForm({
  values,
  keys,
  errors,
  providers,
  persisted,
  systemUser,
  hasPassword,
  onChange,
  onAddKey,
  onRemoveKey,
  onKeyGenerated,
  onBlur,
}: UserFormProps) {
  const userSection = useI18n('users.dialog.section');
  const credentialsSection = useI18n('users.dialog.credentials');
  const rolesSection = useI18n('users.dialog.roles');
  const groupsSection = useI18n('users.dialog.groups');
  const nameLabel = useI18n('users.dialog.name');
  const providerLabel = useI18n('users.dialog.idProvider');
  const providerPlaceholder = useI18n('users.dialog.idProviderPlaceholder');
  const emailLabel = useI18n('users.dialog.email');
  const rolesPlaceholder = useI18n('users.dialog.rolesPlaceholder');
  const groupsPlaceholder = useI18n('users.dialog.groupsPlaceholder');

  const nameError = errors.name === undefined ? undefined : i18n(errors.name);
  const emailError = errors.email === undefined ? undefined : i18n(errors.email);
  const providerError = errors.idProvider === undefined ? undefined : i18n(errors.idProvider);

  const providerName =
    providers.find(({ key }) => key === values.idProvider)?.displayName ?? values.idProvider;

  const { action, clearable } = passwordActions(hasPassword);

  return (
    <>
      <FieldSection label={userSection}>
        <div className="flex flex-col gap-1.5">
          <FieldLabel text={nameLabel} required={!persisted} htmlFor={NAME_ID} />
          <Input
            id={NAME_ID}
            className="max-w-md"
            value={values.name}
            error={nameError}
            disabled={persisted}
            onInput={({ currentTarget }) => onChange({ ...values, name: currentTarget.value })}
            onBlur={() => onBlur('name')}
          />
        </div>

        <div className="flex max-w-md flex-col gap-1.5">
          <FieldLabel id={PROVIDER_LABEL_ID} text={providerLabel} required={!persisted} />
          <Selector.Root
            value={values.idProvider}
            onValueChange={(idProvider) => {
              onBlur('idProvider');
              onChange({ ...values, idProvider });
            }}
            disabled={persisted}
            error={providerError !== undefined}
          >
            <Selector.Trigger aria-labelledby={PROVIDER_LABEL_ID}>
              <Selector.Value placeholder={providerPlaceholder}>
                {values.idProvider.length > 0 ? providerName : undefined}
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

        {!systemUser && (
          <div className="flex flex-col gap-1.5">
            <FieldLabel text={emailLabel} required htmlFor={EMAIL_ID} />
            <Input
              id={EMAIL_ID}
              className="max-w-md"
              type="email"
              value={values.email}
              error={emailError}
              onInput={({ currentTarget }) => onChange({ ...values, email: currentTarget.value })}
              onBlur={() => onBlur('email')}
            />
          </div>
        )}
      </FieldSection>

      <FieldSection label={credentialsSection}>
        <CredentialsSection
          action={action}
          clearable={clearable}
          publicKeys={showsPublicKeys(values)}
          keys={keys}
          persisted={persisted}
          password={values.password}
          cleared={values.clearPassword === true}
          error={errors.password === undefined ? undefined : i18n(errors.password)}
          onPasswordChange={(password) =>
            onChange({ ...values, password, clearPassword: undefined })
          }
          onClearedChange={(cleared) =>
            onChange({ ...values, password: undefined, clearPassword: cleared || undefined })
          }
          onAddKey={onAddKey}
          onRemoveKey={onRemoveKey}
          onKeyGenerated={onKeyGenerated}
          onBlur={() => onBlur('password')}
        />
      </FieldSection>

      {!systemUser && (
        <>
          <FieldSection label={rolesSection} count={values.roles.length}>
            <PrincipalPicker
              kinds={['role']}
              excluded={IMPLICIT_ROLE_KEYS}
              placeholder={rolesPlaceholder}
              selected={values.roles}
              onChange={(roles) => onChange({ ...values, roles })}
            />
          </FieldSection>

          <FieldSection label={groupsSection} count={values.groups.length}>
            <PrincipalPicker
              kinds={['group']}
              placeholder={groupsPlaceholder}
              selected={values.groups}
              onChange={(groups) => onChange({ ...values, groups })}
            />
          </FieldSection>
        </>
      )}
    </>
  );
}
