import {
  IMPLICIT_ROLE_KEYS,
  idProviderOf,
  isPlatformRole,
  principalName,
  splitMembers,
  type RoleDetail,
} from '../../entities/principal';
import { PrincipalAvatars } from '../../entities/principal/ui/PrincipalAvatars';
import { PrincipalEditButton } from '../../entities/principal/ui/PrincipalEditButton';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import { openRoleEditorAt } from '../../features/role-editor';
import { isReadOnlyMode } from '../../shared/config';
import { formatDateTime } from '../../shared/format';
import { useI18n } from '../../shared/i18n';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';

export type RoleDetailsProps = {
  role: RoleDetail;
  'data-component'?: string;
};

const ROLE_DETAILS_NAME = 'RoleDetails';

export function RoleDetails({
  role,
  'data-component': componentName = ROLE_DETAILS_NAME,
}: RoleDetailsProps) {
  const readOnly = isReadOnlyMode();
  // The platform owns its roles' names, and Everyone's and Authenticated's members too.
  const platform = isPlatformRole(role.key);
  const implicit = IMPLICIT_ROLE_KEYS.has(role.key);

  const editLabel = useI18n('browse.details.edit');
  const editUsersLabel = useI18n('roles.details.editUsers');
  const editServiceAccountsLabel = useI18n('roles.details.editServiceAccounts');
  const editGroupsLabel = useI18n('roles.details.editGroups');
  const noDescriptionLabel = useI18n('roles.details.noDescription');
  const systemLabel = useI18n('principal.type.system');
  const lockedLabel = useI18n(
    implicit ? 'principal.details.lockedImplicit' : 'principal.details.lockedPlatform',
  );

  const { key, displayName, description, modifiedTime, members } = role;

  const { users, serviceAccounts, groups } = splitMembers(members);

  return (
    <DetailsPanel data-component={componentName}>
      <DetailsPanel.Header
        icon={<PrincipalIcon principal={role} size="lg" />}
        title={displayName}
        subtitle={principalName(key)}
      />

      <DetailsPanel.Section
        labelKey="roles.details.role"
        action={
          readOnly ? undefined : (
            <PrincipalEditButton
              label={editLabel}
              locked={platform}
              onClick={() => openRoleEditorAt(role, 'general')}
            />
          )
        }
      >
        {platform && (
          <DetailsPanel.Field labelKey="roles.details.type">{systemLabel}</DetailsPanel.Field>
        )}
        <DetailsPanel.Field labelKey="roles.details.description">
          {description ?? noDescriptionLabel}
        </DetailsPanel.Field>
        {modifiedTime !== undefined && (
          <DetailsPanel.Field labelKey="roles.details.timestamps">
            {formatDateTime(modifiedTime)}
          </DetailsPanel.Field>
        )}
        {platform && (
          <DetailsPanel.Field labelKey="principal.details.editing">
            {lockedLabel}
          </DetailsPanel.Field>
        )}
      </DetailsPanel.Section>

      <DetailsPanel.Section
        labelKey="roles.details.users"
        count={users.length}
        action={
          readOnly ? undefined : (
            <PrincipalEditButton
              label={editUsersLabel}
              locked={implicit}
              onClick={() => openRoleEditorAt(role, 'users')}
            />
          )
        }
      >
        <PrincipalAvatars principals={users} />
      </DetailsPanel.Section>

      <DetailsPanel.Section
        labelKey="roles.details.serviceAccounts"
        count={serviceAccounts.length}
        action={
          readOnly ? undefined : (
            <PrincipalEditButton
              label={editServiceAccountsLabel}
              locked={implicit}
              onClick={() => openRoleEditorAt(role, 'users')}
            />
          )
        }
      >
        <DetailsPanel.List items={serviceAccounts}>
          {(member) => (
            <DetailsPanel.ListItem
              key={member.key}
              icon={<PrincipalIcon principal={member} />}
              title={member.displayName}
              subtitle={principalName(member.key)}
            />
          )}
        </DetailsPanel.List>
      </DetailsPanel.Section>

      <DetailsPanel.Section
        labelKey="roles.details.groups"
        count={groups.length}
        action={
          readOnly ? undefined : (
            <PrincipalEditButton
              label={editGroupsLabel}
              locked={implicit}
              onClick={() => openRoleEditorAt(role, 'groups')}
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
              meta={idProviderOf(member.key)}
            />
          )}
        </DetailsPanel.List>
      </DetailsPanel.Section>
    </DetailsPanel>
  );
}

RoleDetails.displayName = ROLE_DETAILS_NAME;
