import { Avatar, Button } from '@enonic/ui';

import { principalName, useIdProviderName, type RoleDetail } from '../../entities/principal';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import { openRoleEditor } from '../../features/role-editor';
import { formatDateTime, getInitials } from '../../shared/format';
import { useI18n } from '../../shared/i18n';
import { filledSections } from '../../widgets/details-panel/details-panel';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';

export type RoleDetailsProps = {
  role: RoleDetail;
};

export function RoleDetails({ role }: RoleDetailsProps) {
  const providerName = useIdProviderName();

  const editLabel = useI18n('roles.details.edit');
  const noDescriptionLabel = useI18n('roles.details.noDescription');

  const { key, displayName, description, modifiedTime, members } = role;

  // Users first, groups last, both flat: a group in a role is a row, not a branch.
  const memberSubsections = filledSections([
    { labelKey: 'roles.details.users', items: members.filter(({ type }) => type === 'user') },
    { labelKey: 'roles.details.groups', items: members.filter(({ type }) => type === 'group') },
  ]);

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
          {memberSubsections.map(({ labelKey, items }) => (
            <DetailsPanel.Subsection key={labelKey} labelKey={labelKey} count={items.length}>
              <DetailsPanel.List>
                {items.map((member) => (
                  <DetailsPanel.ListItem
                    key={member.key}
                    icon={
                      <Avatar size="sm">
                        <Avatar.Fallback>{getInitials(member.displayName)}</Avatar.Fallback>
                      </Avatar>
                    }
                    title={member.displayName}
                    subtitle={principalName(member.key)}
                    meta={providerName(member.key)}
                  />
                ))}
              </DetailsPanel.List>
            </DetailsPanel.Subsection>
          ))}
        </DetailsPanel.Section>
      )}
    </DetailsPanel>
  );
}
