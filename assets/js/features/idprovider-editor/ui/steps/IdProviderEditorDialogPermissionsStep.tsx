import { Selector } from '@enonic/ui';
import { useStore } from '@nanostores/preact';
import { useMemo } from 'preact/hooks';

import type { IdProviderAccess, PrincipalRef, PrincipalType } from '../../../../entities/principal';
import { PrincipalPicker } from '../../../../entities/principal/ui/PrincipalPicker';
import { visitedErrors } from '../../../../shared/form';
import { i18n, useI18n, useLabelled } from '../../../../shared/i18n';
import { SelectorPopup } from '../../../../shared/ui/SelectorPopup';
import { ID_PROVIDER_ACCESS_LEVELS } from '../../model/idprovider-access';
import { $idProviderDefaultPermissions } from '../../model/idprovider-defaults';
import { $idProviderEditDetail } from '../../model/idprovider-edit-detail';
import {
  $idProviderEditor,
  $idProviderEditorErrors,
  markIdProviderEditorFieldVisited,
  updateIdProviderEditorForm,
} from '../../model/idprovider-editor.store';
import {
  pinnedPermissions,
  withPermissionAccess,
  withPermissionPrincipals,
} from '../../model/idprovider-form';

// Users, groups and roles alike: app-users offers all three, and a role is what an install usually grants.
const KINDS: readonly PrincipalType[] = ['user', 'group', 'role'];

export function IdProviderEditorDialogPermissionsStep() {
  const { form, visited } = useStore($idProviderEditor, { keys: ['form', 'visited'] });
  const errors = useStore($idProviderEditorErrors);
  const { status } = useStore($idProviderEditDetail);
  const defaults = useStore($idProviderDefaultPermissions);

  const pickerPlaceholder = useI18n('idProviders.dialog.permissionsPlaceholder');
  const failedNotice = useI18n('idProviders.dialog.permissionsFailed');

  const levels = useLabelled(ID_PROVIDER_ACCESS_LEVELS);

  const { permissions } = form;

  // The seeded principals, pinned wherever they appear: neither their access nor their presence may
  // change, since app-users lets neither stick.
  const defaultPrincipals = useMemo(
    () => new Set(defaults.map(({ principal }) => principal.key)),
    [defaults],
  );
  const pinned = pinnedPermissions(permissions, defaultPrincipals);

  const shown = visitedErrors(errors, visited);
  const permissionsError = shown.permissions === undefined ? undefined : i18n(shown.permissions);

  const accessOf = (key: string): IdProviderAccess | undefined =>
    permissions.find((entry) => entry.principal.key === key)?.access;

  const handleChange = (next: typeof permissions): void => {
    updateIdProviderEditorForm({ permissions: next });
    // The list has no field to leave, so the edit itself is what lets it report being empty.
    markIdProviderEditorFieldVisited('permissions');
  };

  const handlePrincipals = (principals: readonly PrincipalRef[]): void => {
    handleChange(withPermissionPrincipals(permissions, principals));
  };

  return (
    <div className="flex flex-col gap-3">
      {status === 'error' && <p className="text-error text-sm">{failedNotice}</p>}
      {permissionsError !== undefined && <p className="text-error text-sm">{permissionsError}</p>}

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
              handleChange(withPermissionAccess(permissions, key, access as IdProviderAccess))
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
    </div>
  );
}
