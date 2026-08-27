import { Input, Selector, TextArea } from '@enonic/ui';
import { useMemo } from 'preact/hooks';

import { IMPLICIT_ROLE_KEYS, type IdProviderName } from '../../entities/principal';
import { PrincipalPicker } from '../../entities/principal/ui/PrincipalPicker';
import { i18n, useI18n } from '../../shared/i18n';
import { FieldLabel } from '../../shared/ui/FieldLabel';
import { FieldSection } from '../../shared/ui/FieldSection';
import { SelectorPopup } from '../../shared/ui/SelectorPopup';
import type { GroupFormErrors, GroupForm as GroupFormValues } from './model/group-form';

export type GroupFormProps = {
  values: GroupFormValues;
  errors: GroupFormErrors;
  providers: readonly IdProviderName[];
  /** The group being edited, which the members picker must not offer. Absent while creating. */
  groupKey?: string;
  keyFixed: boolean;
  onChange: (values: GroupFormValues) => void;
  onBlur: (field: 'name' | 'displayName' | 'idProvider') => void;
};

const PROVIDER_LABEL_ID = 'group-id-provider-label';
const NAME_ID = 'group-name';
const DESCRIPTION_ID = 'group-description';

export function GroupForm({
  values,
  errors,
  providers,
  groupKey,
  keyFixed,
  onChange,
  onBlur,
}: GroupFormProps) {
  const groupSection = useI18n('groups.dialog.section');
  const membersSection = useI18n('groups.dialog.members');
  const rolesSection = useI18n('groups.dialog.roles');
  const providerLabel = useI18n('groups.dialog.idProvider');
  const providerPlaceholder = useI18n('groups.dialog.idProviderPlaceholder');
  const nameLabel = useI18n('groups.dialog.name');
  const descriptionLabel = useI18n('groups.dialog.description');
  const membersPlaceholder = useI18n('groups.dialog.membersPlaceholder');
  const rolesPlaceholder = useI18n('groups.dialog.rolesPlaceholder');

  const nameError = errors.name === undefined ? undefined : i18n(errors.name);
  const providerError = errors.idProvider === undefined ? undefined : i18n(errors.idProvider);

  const providerName =
    providers.find(({ key }) => key === values.idProvider)?.displayName ?? values.idProvider;

  // The platform refuses a relationship whose two ends are the same principal.
  const notItself = useMemo(
    () => (groupKey === undefined ? undefined : new Set([groupKey])),
    [groupKey],
  );

  return (
    <>
      <FieldSection label={groupSection}>
        <div className="flex flex-col gap-1.5">
          <FieldLabel text={nameLabel} required={!keyFixed} htmlFor={NAME_ID} />
          <Input
            id={NAME_ID}
            className="max-w-md"
            value={values.name}
            error={nameError}
            disabled={keyFixed}
            onInput={({ currentTarget }) => onChange({ ...values, name: currentTarget.value })}
            onBlur={() => onBlur('name')}
          />
        </div>

        <div className="flex max-w-md flex-col gap-1.5">
          <FieldLabel id={PROVIDER_LABEL_ID} text={providerLabel} required={!keyFixed} />
          <Selector.Root
            value={values.idProvider}
            onValueChange={(idProvider) => {
              onBlur('idProvider');
              onChange({ ...values, idProvider });
            }}
            disabled={keyFixed}
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

        <div className="flex flex-col gap-1.5">
          <FieldLabel text={descriptionLabel} htmlFor={DESCRIPTION_ID} />
          <TextArea
            id={DESCRIPTION_ID}
            value={values.description}
            rows={3}
            onInput={({ currentTarget }) =>
              onChange({ ...values, description: currentTarget.value })
            }
          />
        </div>
      </FieldSection>

      <FieldSection label={membersSection} count={values.members.length}>
        <PrincipalPicker
          kinds={['user', 'group']}
          placeholder={membersPlaceholder}
          selected={values.members}
          excluded={notItself}
          onChange={(members) => onChange({ ...values, members })}
        />
      </FieldSection>

      <FieldSection label={rolesSection} count={values.roles.length}>
        <PrincipalPicker
          kinds={['role']}
          placeholder={rolesPlaceholder}
          selected={values.roles}
          excluded={IMPLICIT_ROLE_KEYS}
          onChange={(roles) => onChange({ ...values, roles })}
        />
      </FieldSection>
    </>
  );
}
