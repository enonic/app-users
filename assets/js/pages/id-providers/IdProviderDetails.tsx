import { Button } from '@enonic/ui';
import { ShieldLock } from 'lucide-react';

import {
  loadMoreIdProviderPrincipals,
  principalName,
  SYSTEM_ID_PROVIDER,
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
import { isReadOnlyMode } from '../../shared/config';
import { useI18n, useLabelled } from '../../shared/i18n';
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
  const readOnly = isReadOnlyMode();
  const editLabel = useI18n('browse.details.edit');
  const editPermissionsLabel = useI18n('idProviders.details.editPermissions');
  const permissionsFailedLabel = useI18n('idProviders.details.permissionsFailed');
  const listFailedLabel = useI18n('idProviders.details.listFailed');
  const noDescriptionLabel = useI18n('idProviders.details.noDescription');
  const applicationNotSetLabel = useI18n('idProviders.details.applicationNotSet');
  const loadMoreFailedLabel = useI18n('browse.list.loadMoreFailed');

  const levels = useLabelled(ID_PROVIDER_ACCESS_LEVELS);
  const accessLabel = (access: IdProviderAccess): string | undefined =>
    levels.find((level) => level.value === access)?.label;

  const { key, displayName, description, application } = provider;

  // The row's totals until the panel's own read answers, so a count appears before the rows do.
  const users = principals?.users;
  const groups = principals?.groups;
  const usersTotal = users?.total ?? provider.users.total;
  const groupsTotal = groups?.total ?? provider.groups.total;
  const system = key === SYSTEM_ID_PROVIDER;

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
          readOnly ? undefined : (
            <Button
              variant="outline"
              size="sm"
              label={editLabel}
              disabled={permissionsFailed}
              onClick={() => openIdProviderEditorAt(provider, 'general')}
            />
          )
        }
      >
        <DetailsPanel.Field labelKey="idProviders.details.description">
          {description ?? noDescriptionLabel}
        </DetailsPanel.Field>
        <DetailsPanel.Field labelKey="idProviders.details.application">
          {application?.displayName ?? applicationNotSetLabel}
        </DetailsPanel.Field>
      </DetailsPanel.Section>

      {/* Shimmer until the read answers: absent is "not read yet", an empty list is "nobody". */}
      <DetailsPanel.Section
        labelKey="idProviders.details.permissions"
        count={permissions?.length}
        action={
          readOnly ? undefined : (
            <Button
              variant="outline"
              size="sm"
              label={editPermissionsLabel}
              disabled={permissionsFailed}
              onClick={() => openIdProviderEditorAt(provider, 'permissions')}
            />
          )
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

      {usersTotal > 0 && (
        <DetailsPanel.Section
          labelKey={system ? 'idProviders.details.serviceAccounts' : 'idProviders.details.users'}
          count={usersTotal}
        >
          {principalsLoading === true && <DetailsListSkeleton />}

          {users !== undefined && !system && (
            <PrincipalAvatars
              principals={users.items}
              total={users.total}
              onLoadMore={() => loadMoreIdProviderPrincipals('user')}
              loadingMore={users.appending}
            />
          )}

          {users !== undefined && system && (
            <DetailsPanel.List
              items={users.items}
              total={users.total}
              onLoadMore={() => loadMoreIdProviderPrincipals('user')}
              loadingMore={users.appending}
            >
              {(principal) => (
                <DetailsPanel.ListItem
                  key={principal.key}
                  icon={<PrincipalIcon principal={principal} />}
                  title={principal.displayName}
                  subtitle={principalName(principal.key)}
                />
              )}
            </DetailsPanel.List>
          )}

          {users?.error !== undefined && (
            <p className="text-error text-sm">{loadMoreFailedLabel}</p>
          )}

          {principalsFailed && <p className="text-error text-sm">{listFailedLabel}</p>}
        </DetailsPanel.Section>
      )}

      {groupsTotal > 0 && (
        <DetailsPanel.Section labelKey="idProviders.details.groups" count={groupsTotal}>
          {principalsLoading === true && <DetailsListSkeleton />}

          {groups !== undefined && (
            <DetailsPanel.List
              items={groups.items}
              total={groups.total}
              onLoadMore={() => loadMoreIdProviderPrincipals('group')}
              loadingMore={groups.appending}
            >
              {(principal) => (
                <DetailsPanel.ListItem
                  key={principal.key}
                  icon={<PrincipalIcon principal={principal} />}
                  title={principal.displayName}
                  subtitle={principalName(principal.key)}
                />
              )}
            </DetailsPanel.List>
          )}

          {groups?.error !== undefined && (
            <p className="text-error text-sm">{loadMoreFailedLabel}</p>
          )}

          {principalsFailed && <p className="text-error text-sm">{listFailedLabel}</p>}
        </DetailsPanel.Section>
      )}
    </DetailsPanel>
  );
}
