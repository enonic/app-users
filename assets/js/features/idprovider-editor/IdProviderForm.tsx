import { GridList, IconButton, Input, Selector, TextArea } from '@enonic/ui';
import { Pencil, X } from 'lucide-react';
import { useState } from 'preact/hooks';

import { ApplicationIcon, type IdProviderApplication } from '../../entities/application';
import { i18n, useI18n } from '../../shared/i18n';
import { FieldLabel } from '../../shared/ui/FieldLabel';
import { FieldSection } from '../../shared/ui/FieldSection';
import { ItemLabel } from '../../shared/ui/ItemLabel';
import { SelectorPopup } from '../../shared/ui/SelectorPopup';
import { ConfigDialog } from './ConfigDialog';
import type {
  IdProviderFormErrors,
  IdProviderFormField,
  IdProviderForm as IdProviderFormValues,
} from './model/idprovider-form';
import { PermissionsSection } from './PermissionsSection';

export type IdProviderFormProps = {
  values: IdProviderFormValues;
  errors: IdProviderFormErrors;
  applications: readonly IdProviderApplication[];
  nameFixed: boolean;
  /** The system provider answers to the platform's own login and may not be bound elsewhere. */
  applicationFixed: boolean;
  /** The principals a provider is seeded with, pinned wherever they appear — see `PermissionsSection`. */
  defaultPrincipals?: ReadonlySet<string>;
  onChange: (values: IdProviderFormValues) => void;
  onBlur: (field: IdProviderFormField) => void;
};

const APPLICATION_LABEL_ID = 'id-provider-application-label';
const NAME_ID = 'id-provider-name';
const DESCRIPTION_ID = 'id-provider-description';

export function IdProviderForm({
  values,
  errors,
  applications,
  nameFixed,
  applicationFixed,
  defaultPrincipals,
  onChange,
  onBlur,
}: IdProviderFormProps) {
  const providerSection = useI18n('idProviders.dialog.section');
  const nameLabel = useI18n('idProviders.dialog.name');
  const descriptionLabel = useI18n('idProviders.dialog.description');
  const applicationLabel = useI18n('idProviders.dialog.application');
  const applicationPlaceholder = useI18n('idProviders.dialog.applicationPlaceholder');
  const configLabel = useI18n('idProviders.dialog.editConfig');
  const clearApplicationLabel = useI18n('idProviders.dialog.clearApplication');

  const [configuring, setConfiguring] = useState(false);

  const nameError = errors.name === undefined ? undefined : i18n(errors.name);

  const selected = applications.find(({ key }) => key === values.application);

  const handlePermissions = (permissions: IdProviderFormValues['permissions']): void => {
    onChange({ ...values, permissions });
    // The list has no field to leave, so the edit itself is what lets it report being empty.
    onBlur('permissions');
  };

  return (
    <>
      <FieldSection label={providerSection}>
        <div className="flex flex-col gap-1.5">
          <FieldLabel text={nameLabel} required={!nameFixed} htmlFor={NAME_ID} />
          <Input
            id={NAME_ID}
            className="max-w-md"
            value={values.name}
            error={nameError}
            disabled={nameFixed}
            onInput={({ currentTarget }) => onChange({ ...values, name: currentTarget.value })}
            onBlur={() => onBlur('name')}
          />
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

        <div className="flex flex-col gap-1.5">
          <FieldLabel id={APPLICATION_LABEL_ID} text={applicationLabel} />

          {/* Value fixed at empty, so the trigger reads as "pick one" and never repeats what the row
              below already says — the same division `PrincipalPicker` draws between its input and its
              picked rows. Choosing again replaces the binding in one click. */}
          <Selector.Root
            value=""
            disabled={applicationFixed}
            onValueChange={(application) => onChange({ ...values, application })}
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

          {values.application !== '' && (
            <GridList
              labelledBy={APPLICATION_LABEL_ID}
              className="flex flex-col gap-2.5 rounded-md py-1.5 pr-1 pl-1"
            >
              <GridList.Row id={`${values.application}-bound`} className="gap-2.5 p-1">
                <GridList.Cell interactive={false} className="flex-1 self-stretch">
                  <ItemLabel
                    className="min-w-0 flex-1"
                    icon={<ApplicationIcon />}
                    primary={selected?.displayName ?? values.application}
                    secondary={selected === undefined ? undefined : values.application}
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
                      onClick={() => onChange({ ...values, application: '' })}
                    />
                  </GridList.Action>
                </GridList.Cell>
              </GridList.Row>
            </GridList>
          )}
        </div>
      </FieldSection>

      <PermissionsSection
        permissions={values.permissions}
        error={errors.permissions === undefined ? undefined : i18n(errors.permissions)}
        defaults={defaultPrincipals}
        onChange={handlePermissions}
      />

      <ConfigDialog
        open={configuring}
        application={selected?.displayName ?? values.application}
        onClose={() => setConfiguring(false)}
      />
    </>
  );
}
