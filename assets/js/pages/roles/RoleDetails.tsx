import { Button } from '@enonic/ui';

import { principalName, useIdProviderName, type RoleDetail } from '../../entities/principal';
import { PrincipalAvatars } from '../../entities/principal/ui/PrincipalAvatars';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import { openRoleEditor } from '../../features/role-editor';
import { formatDateTime } from '../../shared/format';
import { useI18n } from '../../shared/i18n';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';

export type RoleDetailsProps = {
  role: RoleDetail;
};

export function RoleDetails({ role }: RoleDetailsProps) {
  const providerName = useIdProviderName();

  const editLabel = useI18n('roles.details.edit');
  const noDescriptionLabel = useI18n('roles.details.noDescription');

  const { key, displayName, description, modifiedTime, members } = role;

  // Users first as a row of avatars, groups last as rows: a group in a role is a row, not a branch.
  const users = members.filter(({ type }) => type === 'user');
  const groups = members.filter(({ type }) => type === 'group');

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
          <Button
            variant="outline"
            size="sm"
            label={editLabel}
            onClick={() => openRoleEditor(role)}
          />
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

      {members.length > 0 && (
        <DetailsPanel.Section labelKey="roles.details.members" count={members.length}>
          {users.length > 0 && (
            <DetailsPanel.Subsection labelKey="roles.details.users" count={users.length}>
              <PrincipalAvatars principals={users} />
            </DetailsPanel.Subsection>
          )}

          {groups.length > 0 && (
            <DetailsPanel.Subsection labelKey="roles.details.groups" count={groups.length}>
              <DetailsPanel.List>
                {groups.map((member) => (
                  <DetailsPanel.ListItem
                    key={member.key}
                    icon={<PrincipalIcon principal={member} />}
                    title={member.displayName}
                    subtitle={principalName(member.key)}
                    meta={providerName(member.key)}
                  />
                ))}
              </DetailsPanel.List>
            </DetailsPanel.Subsection>
          )}
        </DetailsPanel.Section>
      )}
    </DetailsPanel>
  );
}
