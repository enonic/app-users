import { Button, Checkbox } from '@enonic/ui';
import { KeyRound } from 'lucide-react';
import { useState } from 'preact/hooks';

import {
  isSystemUser,
  principalName,
  useIdProviderName,
  useTransitiveMemberships,
  type PrincipalRef,
  type UserDetail,
} from '../../entities/principal';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import { openServiceAccountEditorAt } from '../../features/user-editor';
import { useI18n } from '../../shared/i18n';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';

export type ServiceAccountDetailsProps = {
  user: UserDetail;
};

/**
 * `UserDetails` without the ID provider field: every account here is the system store's. The accounts the
 * platform owns keep their roles and groups too — those steps only say so — so neither offers an Edit.
 */
export function ServiceAccountDetails({ user }: ServiceAccountDetailsProps) {
  const providerName = useIdProviderName();

  const editLabel = useI18n('serviceAccounts.details.edit');
  const editCredentialsLabel = useI18n('users.details.editCredentials');
  const editRolesLabel = useI18n('users.details.editRoles');
  const editGroupsLabel = useI18n('users.details.editGroups');
  const passwordSetLabel = useI18n('users.details.passwordSet');
  const passwordNotSetLabel = useI18n('users.details.passwordNotSet');
  const unlabelledKeyLabel = useI18n('users.details.keyUnlabelled');
  const transitiveLabel = useI18n('users.details.transitive');
  const transitiveFailedLabel = useI18n('users.details.transitiveFailed');

  const [transitive, setTransitive] = useState(false);

  const { key, displayName, login, email, hasPassword, publicKeys } = user;

  const system = isSystemUser(key);

  // ? Without a group to inherit through, the toggle has nothing to add — and no request to find out.
  const inheritable = user.groups.length > 0;

  const inherited = useTransitiveMemberships(key, 'user', transitive && inheritable);
  const showInherited = transitive && inheritable;
  // The lists follow the toggle; the buttons edit what is set on the account itself.
  const roles: readonly PrincipalRef[] = showInherited ? inherited.roles : user.roles;
  const groups: readonly PrincipalRef[] = showInherited ? inherited.groups : user.groups;

  return (
    <DetailsPanel>
      <DetailsPanel.Header
        icon={<PrincipalIcon principal={user} size="lg" />}
        title={displayName}
        subtitle={login}
      />

      <DetailsPanel.Section
        labelKey="serviceAccounts.details.serviceAccount"
        action={
          <Button
            variant="outline"
            size="sm"
            label={editLabel}
            onClick={() => openServiceAccountEditorAt(user, 'identity')}
          />
        }
      >
        {email !== undefined && (
          <DetailsPanel.Field labelKey="users.details.email">{email}</DetailsPanel.Field>
        )}
      </DetailsPanel.Section>

      <DetailsPanel.Section
        labelKey="users.details.credentials"
        action={
          <Button
            variant="outline"
            size="sm"
            label={editCredentialsLabel}
            onClick={() => openServiceAccountEditorAt(user, 'credentials')}
          />
        }
      >
        <DetailsPanel.Field labelKey="users.details.password">
          {hasPassword ? passwordSetLabel : passwordNotSetLabel}
        </DetailsPanel.Field>
        <DetailsPanel.Subsection labelKey="users.details.publicKeys" count={publicKeys.length}>
          <DetailsPanel.List>
            {publicKeys.map(({ kid, label }) => (
              <DetailsPanel.ListItem
                key={kid}
                icon={<KeyRound size={28} strokeWidth={1.5} aria-hidden />}
                title={label ?? unlabelledKeyLabel}
                subtitle={kid}
              />
            ))}
          </DetailsPanel.List>
        </DetailsPanel.Subsection>
      </DetailsPanel.Section>

      {inheritable && (
        <DetailsPanel.Section labelKey="users.details.memberships">
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

      <DetailsPanel.Section
        labelKey="users.details.roles"
        count={roles.length}
        action={
          system ? undefined : (
            <Button
              variant="outline"
              size="sm"
              label={editRolesLabel}
              onClick={() => openServiceAccountEditorAt(user, 'roles')}
            />
          )
        }
      >
        <DetailsPanel.List>
          {roles.map((principal) => (
            <DetailsPanel.ListItem
              key={principal.key}
              icon={<PrincipalIcon principal={principal} />}
              title={principal.displayName}
              subtitle={principalName(principal.key)}
            />
          ))}
        </DetailsPanel.List>
      </DetailsPanel.Section>

      <DetailsPanel.Section
        labelKey="users.details.groups"
        count={groups.length}
        action={
          system ? undefined : (
            <Button
              variant="outline"
              size="sm"
              label={editGroupsLabel}
              onClick={() => openServiceAccountEditorAt(user, 'groups')}
            />
          )
        }
      >
        <DetailsPanel.List>
          {groups.map((principal) => (
            <DetailsPanel.ListItem
              key={principal.key}
              icon={<PrincipalIcon principal={principal} />}
              title={principal.displayName}
              subtitle={principalName(principal.key)}
              // A role belongs to no provider, so only a group carries one.
              meta={providerName(principal.key)}
            />
          ))}
        </DetailsPanel.List>
      </DetailsPanel.Section>
    </DetailsPanel>
  );
}
