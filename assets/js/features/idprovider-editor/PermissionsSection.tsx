import { Selector } from '@enonic/ui';

import type {
  IdProviderAccess,
  IdProviderPermission,
  PrincipalRef,
  PrincipalType,
} from '../../entities/principal';
import { PrincipalPicker } from '../../entities/principal/ui/PrincipalPicker';
import { i18n, useI18n, useLabelled } from '../../shared/i18n';
import { FieldSection } from '../../shared/ui/FieldSection';
import { SelectorPopup } from '../../shared/ui/SelectorPopup';
import {
  pinnedPermissions,
  withPermissionAccess,
  withPermissionPrincipals,
} from './model/idprovider-form';

export type PermissionsSectionProps = {
  permissions: readonly IdProviderPermission[];
  error?: string;
  /**
   * The principals a provider is seeded with. Wherever one of them appears in the list it is pinned:
   * neither its access level nor its presence may be changed, since app-users lets neither stick.
   */
  defaults?: ReadonlySet<string>;
  onChange: (permissions: readonly IdProviderPermission[]) => void;
};

// Users, groups and roles alike: app-users offers all three, and a role is what an install usually grants.
const KINDS: readonly PrincipalType[] = ['user', 'group', 'role'];

// The platform's own order, widening.
const ACCESS_LEVELS: readonly { value: IdProviderAccess; labelKey: string }[] = [
  { value: 'READ', labelKey: 'idProviders.dialog.access.read' },
  { value: 'CREATE_USERS', labelKey: 'idProviders.dialog.access.createUsers' },
  { value: 'WRITE_USERS', labelKey: 'idProviders.dialog.access.writeUsers' },
  { value: 'ID_PROVIDER_MANAGER', labelKey: 'idProviders.dialog.access.manager' },
  { value: 'ADMINISTRATOR', labelKey: 'idProviders.dialog.access.administrator' },
];

export function PermissionsSection({
  permissions,
  error,
  defaults,
  onChange,
}: PermissionsSectionProps) {
  const sectionLabel = useI18n('idProviders.dialog.permissions');
  const pickerPlaceholder = useI18n('idProviders.dialog.permissionsPlaceholder');

  const levels = useLabelled(ACCESS_LEVELS);

  const pinned = pinnedPermissions(permissions, defaults ?? new Set());

  const accessOf = (key: string): IdProviderAccess | undefined =>
    permissions.find((entry) => entry.principal.key === key)?.access;

  const handlePrincipals = (principals: readonly PrincipalRef[]): void => {
    onChange(withPermissionPrincipals(permissions, principals));
  };

  return (
    <FieldSection label={sectionLabel} count={permissions.length}>
      {error !== undefined && <p className="text-error text-sm">{error}</p>}

      <PrincipalPicker
        selected={permissions.map(({ principal }) => principal)}
        onChange={handlePrincipals}
        kinds={KINDS}
        placeholder={pickerPlaceholder}
        locked={pinned}
        rowTrailing={({ key, displayName }) => (
          <Selector.Root
            value={accessOf(key)}
            disabled={pinned.has(key)}
            onValueChange={(access) =>
              onChange(withPermissionAccess(permissions, key, access as IdProviderAccess))
            }
          >
            <Selector.Trigger
              aria-label={i18n('idProviders.dialog.access.labelFor', displayName)}
              className="w-56"
            >
              <Selector.Value>
                {levels.find((level) => level.value === accessOf(key))?.label}
              </Selector.Value>
              <Selector.Icon />
            </Selector.Trigger>
            <SelectorPopup>
              {levels.map(({ value, label }) => (
                <Selector.Item key={value} value={value} textValue={label}>
                  <Selector.ItemText>{label}</Selector.ItemText>
                </Selector.Item>
              ))}
            </SelectorPopup>
          </Selector.Root>
        )}
      />
    </FieldSection>
  );
}
