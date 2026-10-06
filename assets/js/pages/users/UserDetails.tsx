import { Checkbox } from '@enonic/ui';
import { useState } from 'preact/hooks';

import {
  allowsWrite,
  idProviderOf,
  principalName,
  useIdProviderMode,
  useIdProviderName,
  useTransitiveMemberships,
  type PrincipalRef,
  type UserDetail,
} from '../../entities/principal';
import { PrincipalEditButton } from '../../entities/principal/ui/PrincipalEditButton';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import { openUserEditorAt } from '../../features/user-editor';
import { isReadOnlyMode } from '../../shared/config';
import { useI18n } from '../../shared/i18n';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';

export type UserDetailsProps = {
  user: UserDetail;
  'data-component'?: string;
};

const USER_DETAILS_NAME = 'UserDetails';

export function UserDetails({
  user,
  'data-component': componentName = USER_DETAILS_NAME,
}: UserDetailsProps) {
  const readOnly = isReadOnlyMode();
  const providerName = useIdProviderName();
  const providerMode = useIdProviderMode();
  const mode = providerMode(user.key);

  const editLabel = useI18n('browse.details.edit');
  const lockedLabel = useI18n(
    mode === 'UNAVAILABLE'
      ? 'principal.details.lockedUnavailable'
      : 'principal.details.lockedExternal',
  );
  const editCredentialsLabel = useI18n('users.details.editCredentials');
  const editRolesLabel = useI18n('users.details.editRoles');
  const editGroupsLabel = useI18n('users.details.editGroups');
  const passwordSetLabel = useI18n('users.details.passwordSet');
  const passwordNotSetLabel = useI18n('users.details.passwordNotSet');
  const transitiveLabel = useI18n('users.details.transitive');
  const transitiveFailedLabel = useI18n('users.details.transitiveFailed');

  const [transitive, setTransitive] = useState(false);

  const { key, displayName, login, email, hasPassword } = user;

  // ! Fail-closed: a provider not loaded yet, or whose application is gone, locks the edit as well. The
  // ! memberships stay open — they live on the role and the group, which the Roles section writes too.
  const locked = !allowsWrite(mode, 'user');

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
    <DetailsPanel data-component={componentName}>
      <DetailsPanel.Header
        icon={<PrincipalIcon principal={user} size="lg" />}
        title={displayName}
        subtitle={login}
      />

      <DetailsPanel.Section
        labelKey="users.details.user"
        action={
          readOnly ? undefined : (
            <PrincipalEditButton
              label={editLabel}
              locked={locked}
              onClick={() => openUserEditorAt(user, 'general')}
            />
          )
        }
      >
        <DetailsPanel.Field labelKey="users.details.idProvider">
          {providerName(key)}
        </DetailsPanel.Field>
        {email !== undefined && (
          <DetailsPanel.Field labelKey="users.details.email">{email}</DetailsPanel.Field>
        )}
        {mode !== undefined && locked && (
          <DetailsPanel.Field labelKey="principal.details.editing">
            {lockedLabel}
          </DetailsPanel.Field>
        )}
      </DetailsPanel.Section>

      {/* The password alone: public keys belong to the system store's accounts, as in the editor. */}
      <DetailsPanel.Section
        labelKey="users.details.credentials"
        action={
          readOnly ? undefined : (
            <PrincipalEditButton
              label={editCredentialsLabel}
              locked={locked}
              onClick={() => openUserEditorAt(user, 'credentials')}
            />
          )
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
          readOnly ? undefined : (
            <PrincipalEditButton
              label={editRolesLabel}
              locked={false}
              onClick={() => openUserEditorAt(user, 'roles')}
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
            />
          )}
        </DetailsPanel.List>
      </DetailsPanel.Section>

      <DetailsPanel.Section
        labelKey="users.details.groups"
        count={groups.length}
        action={
          readOnly ? undefined : (
            <PrincipalEditButton
              label={editGroupsLabel}
              locked={false}
              onClick={() => openUserEditorAt(user, 'groups')}
            />
          )
        }
      >
        <DetailsPanel.List items={groups}>
          {(principal) => (
            <DetailsPanel.ListItem
              key={principal.key}
              icon={<PrincipalIcon principal={principal} />}
              title={principal.displayName}
              subtitle={principalName(principal.key)}
              meta={idProviderOf(principal.key)}
            />
          )}
        </DetailsPanel.List>
      </DetailsPanel.Section>
    </DetailsPanel>
  );
}

UserDetails.displayName = USER_DETAILS_NAME;
