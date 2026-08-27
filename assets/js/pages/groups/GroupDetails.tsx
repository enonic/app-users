import { Avatar, Button, Checkbox } from '@enonic/ui';
import { useState } from 'preact/hooks';

import {
  principalName,
  useIdProviderName,
  useTransitiveMemberships,
  type GroupDetail,
  type PrincipalRef,
} from '../../entities/principal';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import { openGroupEditor } from '../../features/group-editor';
import { getInitials } from '../../shared/format';
import { useI18n } from '../../shared/i18n';
import { filledSections } from '../../widgets/details-panel/details-panel';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';

export type GroupDetailsProps = {
  group: GroupDetail;
};

export function GroupDetails({ group }: GroupDetailsProps) {
  const providerName = useIdProviderName();

  const editLabel = useI18n('groups.details.edit');
  const transitiveLabel = useI18n('groups.details.transitive');
  const transitiveFailedLabel = useI18n('groups.details.transitiveFailed');

  const [transitive, setTransitive] = useState(false);

  const { key, displayName, description, members } = group;

  // ? Without a parent group to inherit through, the toggle has nothing to add.
  const inheritable = group.groups.length > 0;

  const inherited = useTransitiveMemberships(key, 'group', transitive && inheritable);
  const showInherited = transitive && inheritable;
  const roles: readonly PrincipalRef[] = showInherited ? inherited.roles : group.roles;
  const groups: readonly PrincipalRef[] = showInherited ? inherited.groups : group.groups;

  const memberships = filledSections([
    { labelKey: 'groups.details.memberOf', items: groups },
    { labelKey: 'groups.details.roles', items: roles },
  ]);

  // Users first, groups last, both flat: a group inside a group is a row, not a branch.
  const memberSubsections = filledSections([
    {
      labelKey: 'groups.details.users',
      items: members.filter(({ type }) => type === 'user'),
    },
    {
      labelKey: 'groups.details.groups',
      items: members.filter(({ type }) => type === 'group'),
    },
  ]);

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
            onClick={() => openGroupEditor(group)}
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

      {memberships.map(({ labelKey, items }) => (
        <DetailsPanel.Section key={labelKey} labelKey={labelKey} count={items.length}>
          <DetailsPanel.List>
            {items.map((principal) => (
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
      ))}

      {members.length > 0 && (
        <DetailsPanel.Section labelKey="groups.details.members" count={members.length}>
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
