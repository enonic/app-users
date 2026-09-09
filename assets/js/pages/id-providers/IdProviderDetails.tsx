import { Button } from '@enonic/ui';
import { ShieldLock } from 'lucide-react';

import {
  idProviderPrincipalsHasMore,
  loadMoreIdProviderPrincipals,
  principalName,
  type IdProvider,
  type IdProviderAccess,
  type IdProviderPermission,
  type IdProviderPrincipalsState,
  type PrincipalSetType,
} from '../../entities/principal';
import { PrincipalAvatars } from '../../entities/principal/ui/PrincipalAvatars';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import { openIdProviderEditorAt } from '../../features/idprovider-editor';
import { useI18n, useLabelled } from '../../shared/i18n';
import { countedSections } from '../../widgets/details-panel/details-panel';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';

/** The levels in the platform's own order, widening, named for the panel. */
const ACCESS_LEVELS: readonly { value: IdProviderAccess; labelKey: string }[] = [
  { value: 'READ', labelKey: 'idProviders.details.access.read' },
  { value: 'CREATE_USERS', labelKey: 'idProviders.details.access.createUsers' },
  { value: 'WRITE_USERS', labelKey: 'idProviders.details.access.writeUsers' },
  { value: 'ID_PROVIDER_MANAGER', labelKey: 'idProviders.details.access.manager' },
  { value: 'ADMINISTRATOR', labelKey: 'idProviders.details.access.administrator' },
];

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
  const noApplicationLabel = useI18n('idProviders.details.noApplication');
  const loadMoreLabel = useI18n('browse.list.loadMore');
  const loadingMoreLabel = useI18n('browse.list.loadingMore');
  const loadMoreFailedLabel = useI18n('browse.list.loadMoreFailed');
  const listFailedLabel = useI18n('idProviders.details.listFailed');

  const levels = useLabelled(ACCESS_LEVELS);
  const accessLabel = (access: IdProviderAccess): string | undefined =>
    levels.find((level) => level.value === access)?.label;

  const { key, displayName, description, application } = provider;

  // The row's totals until the panel's own read answers, so a count appears before the rows do.
  const sections = countedSections([
    {
      labelKey: 'idProviders.details.users',
      type: 'user' as PrincipalSetType,
      set: principals?.users ?? provider.users,
      rows: principals?.users,
    },
    {
      labelKey: 'idProviders.details.groups',
      type: 'group' as PrincipalSetType,
      set: principals?.groups ?? provider.groups,
      rows: principals?.groups,
    },
  ]);

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
            onClick={() => openIdProviderEditorAt(provider, 'identity')}
          />
        }
      >
        {description !== undefined && (
          <DetailsPanel.Field labelKey="idProviders.details.description">
            {description}
          </DetailsPanel.Field>
        )}
        <DetailsPanel.Field labelKey="idProviders.details.application">
          {application?.displayName ?? noApplicationLabel}
        </DetailsPanel.Field>
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

      {sections.map(({ labelKey, type, set, rows }) => (
        <DetailsPanel.Section key={labelKey} labelKey={labelKey} count={set.total}>
          {/* Absent rows are "not read yet", not "none", so the heading and its count stand alone
              rather than over an empty list. */}
          {/* Ten of the first page, the rest counted off the total: nothing for a `Load more` to add. */}
          {rows !== undefined && type === 'user' && (
            <PrincipalAvatars principals={rows.items} total={set.total} />
          )}

          {rows !== undefined && type === 'group' && (
            <>
              <DetailsPanel.List>
                {rows.items.map((principal) => (
                  <DetailsPanel.ListItem
                    key={principal.key}
                    icon={<PrincipalIcon principal={principal} />}
                    title={principal.displayName}
                    subtitle={principalName(principal.key)}
                  />
                ))}
              </DetailsPanel.List>

              {rows.error !== undefined && (
                <p className="text-error text-sm">{loadMoreFailedLabel}</p>
              )}

              {idProviderPrincipalsHasMore(rows) && (
                <Button
                  variant="text"
                  size="sm"
                  className="self-start"
                  label={rows.appending ? loadingMoreLabel : loadMoreLabel}
                  disabled={rows.appending}
                  onClick={() => loadMoreIdProviderPrincipals(type)}
                />
              )}
            </>
          )}

          {principalsFailed && <p className="text-error text-sm">{listFailedLabel}</p>}
        </DetailsPanel.Section>
      ))}
    </DetailsPanel>
  );
}
