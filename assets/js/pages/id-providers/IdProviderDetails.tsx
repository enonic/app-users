import { Button, Skeleton } from '@enonic/ui';
import { ShieldLock } from 'lucide-react';

import {
  idProviderPrincipalsHasMore,
  loadMoreIdProviderPrincipals,
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
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';

export type IdProviderDetailsProps = {
  provider: IdProvider;
  /** The rows behind the totals, once the panel's own read has answered. */
  principals?: IdProviderPrincipalsState;
  /** That read failed: the totals the row carries still stand, the rows under them are missing. */
  principalsFailed?: boolean;
  /** The access control list, once its own read has answered. */
  permissions?: readonly IdProviderPermission[];
  permissionsFailed?: boolean;
};

export function IdProviderDetails({
  provider,
  principals,
  principalsFailed,
  permissions,
  permissionsFailed,
}: IdProviderDetailsProps) {
  const editLabel = useI18n('idProviders.details.edit');
  const editPermissionsLabel = useI18n('idProviders.details.editPermissions');
  const permissionsFailedLabel = useI18n('idProviders.details.permissionsFailed');
  const loadMoreLabel = useI18n('browse.list.loadMore');
  const loadingMoreLabel = useI18n('browse.list.loadingMore');
  const loadMoreFailedLabel = useI18n('browse.list.loadMoreFailed');
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
            onClick={() => openIdProviderEditorAt(provider, 'identity')}
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

      {/* Heading alone until the read answers: absent is "not read yet", an empty list is "nobody". */}
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
        {permissions !== undefined && (
          <DetailsPanel.List>
            {permissions.map(({ principal, access }) => (
              <DetailsPanel.ListItem
                key={principal.key}
                icon={<PrincipalIcon principal={principal} />}
                title={principal.displayName}
                subtitle={principalName(principal.key)}
                meta={accessLabel(access)}
              />
            ))}
          </DetailsPanel.List>
        )}

        {permissionsFailed && <p className="text-error text-sm">{permissionsFailedLabel}</p>}
      </DetailsPanel.Section>

      <DetailsPanel.Section labelKey="idProviders.details.members" count={total}>
        {users !== undefined && users.total > 0 && (
          <DetailsPanel.Subsection labelKey="idProviders.details.users" count={users.total}>
            <PrincipalAvatars principals={users.items} total={users.total} />
          </DetailsPanel.Subsection>
        )}

        {groups !== undefined && groups.total > 0 && (
          <DetailsPanel.Subsection labelKey="idProviders.details.groups" count={groups.total}>
            <DetailsPanel.List>
              {groups.items.map((principal) => (
                <DetailsPanel.ListItem
                  key={principal.key}
                  icon={<PrincipalIcon principal={principal} />}
                  title={principal.displayName}
                  subtitle={principalName(principal.key)}
                />
              ))}
            </DetailsPanel.List>

            {groups.error !== undefined && (
              <p className="text-error text-sm">{loadMoreFailedLabel}</p>
            )}

            {idProviderPrincipalsHasMore(groups) && (
              <Button
                variant="text"
                size="sm"
                className="self-start"
                label={groups.appending ? loadingMoreLabel : loadMoreLabel}
                disabled={groups.appending}
                onClick={() => loadMoreIdProviderPrincipals('group')}
              />
            )}
          </DetailsPanel.Subsection>
        )}

        {principalsFailed && <p className="text-error text-sm">{listFailedLabel}</p>}
      </DetailsPanel.Section>
    </DetailsPanel>
  );
}

export function IdProviderDetailsSkeleton() {
  return (
    <div className="flex min-h-0 flex-col gap-5 overflow-hidden p-10" aria-busy="true">
      <Skeleton.Group className="flex items-center gap-5">
        <Skeleton shape="rectangle" className="size-12 shrink-0" />
        <div className="flex flex-col gap-2.5">
          <Skeleton shape="rectangle" className="h-7 w-52" />
          <Skeleton shape="rectangle" className="h-5 w-32" />
        </div>
      </Skeleton.Group>

      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton.Group key={index} className="flex flex-col gap-2.5">
          <Skeleton shape="rectangle" className="h-5 w-full" />
          <Skeleton shape="rectangle" className="h-4 w-40" />
          <Skeleton shape="rectangle" className="h-4 w-64" />
        </Skeleton.Group>
      ))}
    </div>
  );
}
