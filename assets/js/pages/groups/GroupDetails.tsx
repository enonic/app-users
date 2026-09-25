import { Button, Checkbox } from '@enonic/ui';
import { useState } from 'preact/hooks';

import {
  principalName,
  splitMembers,
  useIdProviderName,
  useTransitiveMemberships,
  type GroupDetail,
  type PrincipalRef,
} from '../../entities/principal';
import { PrincipalAvatars } from '../../entities/principal/ui/PrincipalAvatars';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import { ServiceAccountIcon } from '../../entities/principal/ui/ServiceAccountIcon';
import { openGroupEditorAt } from '../../features/group-editor';
import { isReadOnlyMode } from '../../shared/config';
import { useI18n } from '../../shared/i18n';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';

export type GroupDetailsProps = {
  group: GroupDetail;
};

export function GroupDetails({ group }: GroupDetailsProps) {
  const readOnly = isReadOnlyMode();
  const providerName = useIdProviderName();

  const editLabel = useI18n('browse.details.edit');
  const editRolesLabel = useI18n('groups.details.editRoles');
  const editUsersLabel = useI18n('groups.details.editUsers');
  const editServiceAccountsLabel = useI18n('groups.details.editServiceAccounts');
  const editGroupsLabel = useI18n('groups.details.editGroups');
  const transitiveLabel = useI18n('groups.details.transitive');
  const transitiveFailedLabel = useI18n('groups.details.transitiveFailed');
  const noDescriptionLabel = useI18n('groups.details.noDescription');

  const [transitive, setTransitive] = useState(false);

  const { key, displayName, description, members } = group;

  // ? Without a parent group to inherit through, the toggle has nothing to add.
  const inheritable = group.groups.length > 0;

  const inherited = useTransitiveMemberships(key, 'group', transitive && inheritable);
  const showInherited = transitive && inheritable;
  // The lists follow the toggle; the buttons edit what is set on the group itself.
  const roles: readonly PrincipalRef[] = showInherited ? inherited.roles : group.roles;
  const groups: readonly PrincipalRef[] = showInherited ? inherited.groups : group.groups;

  const { users, serviceAccounts, groups: memberGroups } = splitMembers(members);

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
          readOnly ? undefined : (
            <Button
              variant="outline"
              size="sm"
              label={editLabel}
              onClick={() => openGroupEditorAt(group, 'general')}
            />
          )
        }
      >
        <DetailsPanel.Field labelKey="groups.details.description">
          {description ?? noDescriptionLabel}
        </DetailsPanel.Field>
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
          <DetailsPanel.List items={groups}>
            {(principal) => (
              <DetailsPanel.ListItem
                key={principal.key}
                icon={<PrincipalIcon principal={principal} />}
                title={principal.displayName}
                subtitle={principalName(principal.key)}
                meta={providerName(principal.key)}
              />
            )}
          </DetailsPanel.List>
        </DetailsPanel.Section>
      )}

      <DetailsPanel.Section
        labelKey="groups.details.roles"
        count={roles.length}
        action={
          readOnly ? undefined : (
            <Button
              variant="outline"
              size="sm"
              label={editRolesLabel}
              onClick={() => openGroupEditorAt(group, 'roles')}
            />
          )
        }
      >
        <DetailsPanel.List items={roles}>
          {(principal) => (
            <DetailsPanel.ListItem
              key={principal.key}
              icon={<PrincipalIcon principal={principal} />}
              title={principal.displayName}
              subtitle={principalName(principal.key)}
              meta={providerName(principal.key)}
            />
          )}
        </DetailsPanel.List>
      </DetailsPanel.Section>

      <DetailsPanel.Section
        labelKey="groups.details.users"
        count={users.length}
        action={
          readOnly ? undefined : (
            <Button
              variant="outline"
              size="sm"
              label={editUsersLabel}
              onClick={() => openGroupEditorAt(group, 'members')}
            />
          )
        }
      >
        <PrincipalAvatars principals={users} />
      </DetailsPanel.Section>

      {serviceAccounts.length > 0 && (
        <DetailsPanel.Section
          labelKey="groups.details.serviceAccounts"
          count={serviceAccounts.length}
          action={
            readOnly ? undefined : (
              <Button
                variant="outline"
                size="sm"
                label={editServiceAccountsLabel}
                onClick={() => openGroupEditorAt(group, 'members')}
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
        labelKey="groups.details.groups"
        count={memberGroups.length}
        action={
          readOnly ? undefined : (
            <Button
              variant="outline"
              size="sm"
              label={editGroupsLabel}
              onClick={() => openGroupEditorAt(group, 'members')}
            />
          )
        }
      >
        <DetailsPanel.List items={memberGroups}>
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
