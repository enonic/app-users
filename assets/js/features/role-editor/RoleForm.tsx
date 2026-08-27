import { Input, TextArea } from '@enonic/ui';

import { PrincipalPicker } from '../../entities/principal/ui/PrincipalPicker';
import { i18n, useI18n } from '../../shared/i18n';
import { FieldLabel } from '../../shared/ui/FieldLabel';
import { FieldSection } from '../../shared/ui/FieldSection';
import type { RoleForm as RoleFormValues, RoleFormErrors } from './model/role-form';

export type RoleFormProps = {
  values: RoleFormValues;
  errors: RoleFormErrors;
  nameFixed: boolean;
  onChange: (values: RoleFormValues) => void;
  onBlur: (field: 'name' | 'displayName') => void;
};

const NAME_ID = 'role-name';
const DESCRIPTION_ID = 'role-description';

export function RoleForm({ values, errors, nameFixed, onChange, onBlur }: RoleFormProps) {
  const roleSection = useI18n('roles.dialog.section');
  const membersSection = useI18n('roles.dialog.members');
  const nameLabel = useI18n('roles.dialog.name');
  const descriptionLabel = useI18n('roles.dialog.description');
  const membersPlaceholder = useI18n('roles.dialog.membersPlaceholder');

  const nameError = errors.name === undefined ? undefined : i18n(errors.name);

  return (
    <>
      <FieldSection label={roleSection}>
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
      </FieldSection>

      <FieldSection label={membersSection} count={values.members.length}>
        <PrincipalPicker
          kinds={['user', 'group']}
          placeholder={membersPlaceholder}
          selected={values.members}
          onChange={(members) => onChange({ ...values, members })}
        />
      </FieldSection>
    </>
  );
}
