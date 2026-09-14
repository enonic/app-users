import { Button, Checkbox } from '@enonic/ui';
import { useState } from 'preact/hooks';

import {
  principalName,
  useIdProviderName,
  useTransitiveMemberships,
  type PrincipalRef,
  type UserDetail,
} from '../../entities/principal';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import { openUserEditorAt } from '../../features/user-editor';
import { useI18n } from '../../shared/i18n';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';

export type UserDetailsProps = {
  user: UserDetail;
};

export function UserDetails({ user }: UserDetailsProps) {
  const providerName = useIdProviderName();

  const editLabel = useI18n('users.details.edit');
  const editCredentialsLabel = useI18n('users.details.editCredentials');
  const editRolesLabel = useI18n('users.details.editRoles');
  const editGroupsLabel = useI18n('users.details.editGroups');
  const passwordSetLabel = useI18n('users.details.passwordSet');
  const passwordNotSetLabel = useI18n('users.details.passwordNotSet');
  const transitiveLabel = useI18n('users.details.transitive');
  const transitiveFailedLabel = useI18n('users.details.transitiveFailed');

  const [transitive, setTransitive] = useState(false);

  const { key, displayName, login, email, hasPassword } = user;

  // ? Without a group to inherit through, the toggle has nothing to add — and no request to find out.
  const inheritable = user.groups.length > 0;

  const inherited = useTransitiveMemberships(key, 'user', transitive && inheritable);
  const showInherited = transitive && inheritable;
  // The lists follow the toggle; the buttons edit what is set on the user itself.
  const roles: readonly PrincipalRef[] = showInherited ? inherited.roles : user.roles;
  const groups: readonly PrincipalRef[] = showInherited ? inherited.groups : user.groups;

  // ! No description and no created/modified pair, though the mockups draw both: XP stores neither for a
  // ! user — see the `disabled` and `modifiedTime` entries in `docs/platform-facts.md`.
  return (
    <DetailsPanel>
      <DetailsPanel.Header
        icon={<PrincipalIcon principal={user} size="lg" />}
        title={displayName}
        subtitle={login}
      />

      <DetailsPanel.Section
        labelKey="users.details.user"
        action={
          <Button
            variant="outline"
            size="sm"
            label={editLabel}
            onClick={() => openUserEditorAt(user, 'general')}
          />
        }
      >
        {email !== undefined && (
          <DetailsPanel.Field labelKey="users.details.email">{email}</DetailsPanel.Field>
        )}
        <DetailsPanel.Field labelKey="users.details.idProvider">
          {providerName(key)}
        </DetailsPanel.Field>
      </DetailsPanel.Section>

      {/* The password alone: public keys belong to the system store's accounts, as in the editor. */}
      <DetailsPanel.Section
        labelKey="users.details.credentials"
        action={
          <Button
            variant="outline"
            size="sm"
            label={editCredentialsLabel}
            onClick={() => openUserEditorAt(user, 'credentials')}
          />
        }
      >
        <DetailsPanel.Field labelKey="users.details.password">
          {hasPassword ? passwordSetLabel : passwordNotSetLabel}
        </DetailsPanel.Field>
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
          <Button
            variant="outline"
            size="sm"
            label={editRolesLabel}
            onClick={() => openUserEditorAt(user, 'roles')}
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
            />
          ))}
        </DetailsPanel.List>
      </DetailsPanel.Section>

      <DetailsPanel.Section
        labelKey="users.details.groups"
        count={groups.length}
        action={
          <Button
            variant="outline"
            size="sm"
            label={editGroupsLabel}
            onClick={() => openUserEditorAt(user, 'groups')}
          />
        }
      >
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
    </DetailsPanel>
  );
}
