import { Button } from '@enonic/ui';
import { ShieldLock } from 'lucide-react';

import {
  principalName,
  type IdProvider,
  type IdProviderAccess,
  type IdProviderPermission,
  type IdProviderPrincipalsState,
} from '../../entities/principal';
import { PrincipalAvatars } from '../../entities/principal/ui/PrincipalAvatars';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import {
  ID_PROVIDER_ACCESS_LEVELS,
  openIdProviderEditorAt,
} from '../../features/idprovider-editor';
import { useI18n, useLabelled } from '../../shared/i18n';
import { DETAILS_LIST_LIMIT } from '../../widgets/details-panel/details-panel';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';
import { DetailsListSkeleton } from '../../widgets/details-panel/DetailsSkeleton';

export type IdProviderDetailsProps = {
  provider: IdProvider;
  /** The rows behind the totals, once the panel's own read has answered. */
  principals?: IdProviderPrincipalsState;
  principalsLoading?: boolean;
  /** That read failed: the totals the row carries still stand, the rows under them are missing. */
  principalsFailed?: boolean;
  /** The access control list, once its own read has answered. */
  permissions?: readonly IdProviderPermission[];
  permissionsLoading?: boolean;
  permissionsFailed?: boolean;
};

export function IdProviderDetails({
  provider,
  principals,
  principalsLoading,
  principalsFailed,
  permissions,
  permissionsLoading,
  permissionsFailed,
}: IdProviderDetailsProps) {
  const editLabel = useI18n('idProviders.details.edit');
  const editPermissionsLabel = useI18n('idProviders.details.editPermissions');
  const permissionsFailedLabel = useI18n('idProviders.details.permissionsFailed');
  const listFailedLabel = useI18n('idProviders.details.listFailed');

  const levels = useLabelled(ID_PROVIDER_ACCESS_LEVELS);
  const accessLabel = (access: IdProviderAccess): string | undefined =>
    levels.find((level) => level.value === access)?.label;

  const { key, displayName, description, application } = provider;

  // The row's totals until the panel's own read answers, so a count appears before the rows do.
  const users = principals?.users;
  const groups = principals?.groups;
  const total = (users?.total ?? provider.users.total) + (groups?.total ?? provider.groups.total);

  return (
    <DetailsPanel>
      <DetailsPanel.Header
        icon={<ShieldLock size={48} strokeWidth={1.5} aria-hidden />}
        title={displayName}
        subtitle={key}
      />

      <DetailsPanel.Section
        labelKey="idProviders.details.info"
        action={
          <Button
            variant="outline"
            size="sm"
            label={editLabel}
            disabled={permissionsFailed}
            onClick={() => openIdProviderEditorAt(provider, 'general')}
          />
        }
      >
        {description !== undefined && (
          <DetailsPanel.Field labelKey="idProviders.details.description">
            {description}
          </DetailsPanel.Field>
        )}
        {application !== undefined && (
          <DetailsPanel.Field labelKey="idProviders.details.application">
            {application.displayName}
          </DetailsPanel.Field>
        )}
      </DetailsPanel.Section>

      {/* Shimmer until the read answers: absent is "not read yet", an empty list is "nobody". */}
      <DetailsPanel.Section
        labelKey="idProviders.details.permissions"
        count={permissions?.length}
        action={
          <Button
            variant="outline"
            size="sm"
            label={editPermissionsLabel}
            disabled={permissionsFailed}
            onClick={() => openIdProviderEditorAt(provider, 'permissions')}
          />
        }
      >
        {permissionsLoading === true && <DetailsListSkeleton />}

        {permissions !== undefined && (
          <DetailsPanel.List items={permissions}>
            {({ principal, access }) => (
              <DetailsPanel.ListItem
                key={principal.key}
                icon={<PrincipalIcon principal={principal} />}
                title={principal.displayName}
                subtitle={principalName(principal.key)}
                meta={accessLabel(access)}
              />
            )}
          </DetailsPanel.List>
        )}

        {permissionsFailed && <p className="text-error text-sm">{permissionsFailedLabel}</p>}
      </DetailsPanel.Section>

      <DetailsPanel.Section labelKey="idProviders.details.members" count={total}>
        {principalsLoading === true && <DetailsListSkeleton />}

        {users !== undefined && users.total > 0 && (
          <DetailsPanel.Subsection labelKey="idProviders.details.users" count={users.total}>
            <PrincipalAvatars principals={users.items} total={users.total} />
          </DetailsPanel.Subsection>
        )}

        {groups !== undefined && groups.total > 0 && (
          <DetailsPanel.Subsection labelKey="idProviders.details.groups" count={groups.total}>
            <DetailsPanel.List items={groups.items} limit={DETAILS_LIST_LIMIT} total={groups.total}>
              {(principal) => (
                <DetailsPanel.ListItem
                  key={principal.key}
                  icon={<PrincipalIcon principal={principal} />}
                  title={principal.displayName}
                  subtitle={principalName(principal.key)}
                />
              )}
            </DetailsPanel.List>
          </DetailsPanel.Subsection>
        )}

        {principalsFailed && <p className="text-error text-sm">{listFailedLabel}</p>}
      </DetailsPanel.Section>
    </DetailsPanel>
  );
}
