import { Button } from '@enonic/ui';

import {
  principalName,
  splitMembers,
  useIdProviderName,
  type RoleDetail,
} from '../../entities/principal';
import { PrincipalAvatars } from '../../entities/principal/ui/PrincipalAvatars';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import { ServiceAccountIcon } from '../../entities/principal/ui/ServiceAccountIcon';
import { openRoleEditorAt } from '../../features/role-editor';
import { isReadOnlyMode } from '../../shared/config';
import { formatDateTime } from '../../shared/format';
import { useI18n } from '../../shared/i18n';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';

export type RoleDetailsProps = {
  role: RoleDetail;
};

export function RoleDetails({ role }: RoleDetailsProps) {
  const readOnly = isReadOnlyMode();
  const providerName = useIdProviderName();

  const editLabel = useI18n('browse.details.edit');
  const editUsersLabel = useI18n('roles.details.editUsers');
  const editServiceAccountsLabel = useI18n('roles.details.editServiceAccounts');
  const editGroupsLabel = useI18n('roles.details.editGroups');
  const noDescriptionLabel = useI18n('roles.details.noDescription');

  const { key, displayName, description, modifiedTime, members } = role;

  const { users, serviceAccounts, groups } = splitMembers(members);

  return (
    <DetailsPanel>
      <DetailsPanel.Header
        icon={<PrincipalIcon principal={role} size="lg" />}
        title={displayName}
        subtitle={principalName(key)}
      />

      <DetailsPanel.Section
        labelKey="roles.details.role"
        action={
          readOnly ? undefined : (
            <Button
              variant="outline"
              size="sm"
              label={editLabel}
              onClick={() => openRoleEditorAt(role, 'general')}
            />
          )
        }
      >
        <DetailsPanel.Field labelKey="roles.details.description">
          {description ?? noDescriptionLabel}
        </DetailsPanel.Field>
        {modifiedTime !== undefined && (
          <DetailsPanel.Field labelKey="roles.details.timestamps">
            {formatDateTime(modifiedTime)}
          </DetailsPanel.Field>
        )}
      </DetailsPanel.Section>

      <DetailsPanel.Section
        labelKey="roles.details.users"
        count={users.length}
        action={
          readOnly ? undefined : (
            <Button
              variant="outline"
              size="sm"
              label={editUsersLabel}
              onClick={() => openRoleEditorAt(role, 'members')}
            />
          )
        }
      >
        <PrincipalAvatars principals={users} />
      </DetailsPanel.Section>

      {serviceAccounts.length > 0 && (
        <DetailsPanel.Section
          labelKey="roles.details.serviceAccounts"
          count={serviceAccounts.length}
          action={
            readOnly ? undefined : (
              <Button
                variant="outline"
                size="sm"
                label={editServiceAccountsLabel}
                onClick={() => openRoleEditorAt(role, 'members')}
              />
            )
          }
        >
          <DetailsPanel.List items={serviceAccounts}>
            {(member) => (
              <DetailsPanel.ListItem
                key={member.key}
                icon={<ServiceAccountIcon />}
                title={member.displayName}
                subtitle={principalName(member.key)}
              />
            )}
          </DetailsPanel.List>
        </DetailsPanel.Section>
      )}

      <DetailsPanel.Section
        labelKey="roles.details.groups"
        count={groups.length}
        action={
          readOnly ? undefined : (
            <Button
              variant="outline"
              size="sm"
              label={editGroupsLabel}
              onClick={() => openRoleEditorAt(role, 'members')}
            />
          )
        }
      >
        <DetailsPanel.List items={groups}>
          {(member) => (
            <DetailsPanel.ListItem
              key={member.key}
              icon={<PrincipalIcon principal={member} />}
              title={member.displayName}
              subtitle={principalName(member.key)}
              meta={providerName(member.key)}
            />
          )}
        </DetailsPanel.List>
      </DetailsPanel.Section>
    </DetailsPanel>
  );
}
