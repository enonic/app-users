import { Button, Checkbox } from '@enonic/ui';
import { useState } from 'preact/hooks';

import {
  principalName,
  useIdProviderName,
  useTransitiveMemberships,
  type GroupDetail,
  type PrincipalRef,
} from '../../entities/principal';
import { PrincipalAvatars } from '../../entities/principal/ui/PrincipalAvatars';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import { openGroupEditorAt } from '../../features/group-editor';
import { useI18n } from '../../shared/i18n';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';

export type GroupDetailsProps = {
  group: GroupDetail;
};

export function GroupDetails({ group }: GroupDetailsProps) {
  const providerName = useIdProviderName();

  const editLabel = useI18n('groups.details.edit');
  const editRolesLabel = useI18n('groups.details.editRoles');
  const editMembersLabel = useI18n('groups.details.editMembers');
  const transitiveLabel = useI18n('groups.details.transitive');
  const transitiveFailedLabel = useI18n('groups.details.transitiveFailed');

  const [transitive, setTransitive] = useState(false);

  const { key, displayName, description, members } = group;

  // ? Without a parent group to inherit through, the toggle has nothing to add.
  const inheritable = group.groups.length > 0;

  const inherited = useTransitiveMemberships(key, 'group', transitive && inheritable);
  const showInherited = transitive && inheritable;
  // The lists follow the toggle; the buttons edit what is set on the group itself.
  const roles: readonly PrincipalRef[] = showInherited ? inherited.roles : group.roles;
  const groups: readonly PrincipalRef[] = showInherited ? inherited.groups : group.groups;

  // Users first as a row of avatars, groups last as rows: a group inside a group is a row, not a branch.
  const users = members.filter(({ type }) => type === 'user');
  const memberGroups = members.filter(({ type }) => type === 'group');

  return (
    <DetailsPanel>
      <DetailsPanel.Header
        icon={<PrincipalIcon principal={group} size="lg" />}
        title={displayName}
        subtitle={principalName(key)}
      />

      <DetailsPanel.Section
        labelKey="groups.details.info"
        action={
          <Button
            variant="outline"
            size="sm"
            label={editLabel}
            onClick={() => openGroupEditorAt(group, 'identity')}
          />
        }
      >
        {description !== undefined && (
          <DetailsPanel.Field labelKey="groups.details.description">
            {description}
          </DetailsPanel.Field>
        )}
        <DetailsPanel.Field labelKey="groups.details.idProvider">
          {providerName(key)}
        </DetailsPanel.Field>
      </DetailsPanel.Section>

      {inheritable && (
        <DetailsPanel.Section labelKey="groups.details.memberships">
          <Checkbox
            checked={transitive}
            label={transitiveLabel}
            onCheckedChange={(next) => setTransitive(next === true)}
          />
          {inherited.status === 'error' && (
            <p className="text-error text-sm">{transitiveFailedLabel}</p>
          )}
        </DetailsPanel.Section>
      )}

      {groups.length > 0 && (
        <DetailsPanel.Section labelKey="groups.details.memberOf" count={groups.length}>
          <DetailsPanel.List>
            {groups.map((principal) => (
              <DetailsPanel.ListItem
                key={principal.key}
                icon={<PrincipalIcon principal={principal} />}
                title={principal.displayName}
                subtitle={principalName(principal.key)}
                meta={providerName(principal.key)}
              />
            ))}
          </DetailsPanel.List>
        </DetailsPanel.Section>
      )}

      <DetailsPanel.Section
        labelKey="groups.details.roles"
        count={roles.length}
        action={
          <Button
            variant="outline"
            size="sm"
            label={editRolesLabel}
            onClick={() => openGroupEditorAt(group, 'roles')}
          />
        }
      >
        <DetailsPanel.List>
          {roles.map((principal) => (
            <DetailsPanel.ListItem
              key={principal.key}
              icon={<PrincipalIcon principal={principal} />}
              title={principal.displayName}
              subtitle={principalName(principal.key)}
              meta={providerName(principal.key)}
            />
          ))}
        </DetailsPanel.List>
      </DetailsPanel.Section>

      <DetailsPanel.Section
        labelKey="groups.details.members"
        count={members.length}
        action={
          <Button
            variant="outline"
            size="sm"
            label={editMembersLabel}
            onClick={() => openGroupEditorAt(group, 'members')}
          />
        }
      >
        {users.length > 0 && (
          <DetailsPanel.Subsection labelKey="groups.details.users" count={users.length}>
            <PrincipalAvatars principals={users} />
          </DetailsPanel.Subsection>
        )}

        {memberGroups.length > 0 && (
          <DetailsPanel.Subsection labelKey="groups.details.groups" count={memberGroups.length}>
            <DetailsPanel.List>
              {memberGroups.map((member) => (
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
    </DetailsPanel>
  );
}
