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
import { openServiceAccountEditor } from '../../features/user-editor';
import { useI18n } from '../../shared/i18n';
import { filledSections } from '../../widgets/details-panel/details-panel';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';

export type ServiceAccountDetailsProps = {
  user: UserDetail;
};

/** `UserDetails` without the ID provider field: every account here is the system store's. */
export function ServiceAccountDetails({ user }: ServiceAccountDetailsProps) {
  const providerName = useIdProviderName();

  const editLabel = useI18n('serviceAccounts.details.edit');
  const transitiveLabel = useI18n('users.details.transitive');
  const transitiveFailedLabel = useI18n('users.details.transitiveFailed');

  const [transitive, setTransitive] = useState(false);

  const { key, displayName, login, email } = user;

  // ? Without a group to inherit through, the toggle has nothing to add — and no request to find out.
  const inheritable = user.groups.length > 0;

  const inherited = useTransitiveMemberships(key, 'user', transitive && inheritable);
  const showInherited = transitive && inheritable;
  const roles: readonly PrincipalRef[] = showInherited ? inherited.roles : user.roles;
  const groups: readonly PrincipalRef[] = showInherited ? inherited.groups : user.groups;

  const memberships = filledSections([
    { labelKey: 'users.details.roles', items: roles, provenance: false },
    { labelKey: 'users.details.groups', items: groups, provenance: true },
  ]);

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
            onClick={() => openServiceAccountEditor(user)}
          />
        }
      >
        {email !== undefined && (
          <DetailsPanel.Field labelKey="users.details.email">{email}</DetailsPanel.Field>
        )}
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

      {memberships.map(({ labelKey, items, provenance }) => (
        <DetailsPanel.Section key={labelKey} labelKey={labelKey} count={items.length}>
          <DetailsPanel.List>
            {items.map((principal) => (
              <DetailsPanel.ListItem
                key={principal.key}
                icon={<PrincipalIcon principal={principal} />}
                title={principal.displayName}
                subtitle={principalName(principal.key)}
                // A role belongs to no provider, so only a group carries one.
                meta={provenance ? providerName(principal.key) : undefined}
              />
            ))}
          </DetailsPanel.List>
        </DetailsPanel.Section>
      ))}
    </DetailsPanel>
  );
}
