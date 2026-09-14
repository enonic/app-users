import { principalName, useRole, useRoles } from '../../entities/principal';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import { useItemId } from '../../shared/host';
import { detailsEmptyLabelKey } from '../../widgets/details-panel/details-panel';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';
import { RoleDetails } from './RoleDetails';

export function RolesItemPage() {
  const id = useItemId();
  const { status, item: role } = useRole(id);
  const { items } = useRoles();

  // Loading with a role on screen is a re-read of that role: it stays.
  if (status === 'loading' && role === undefined) {
    const row = items.find(({ key }) => key === id);

    return (
      <DetailsPanel>
        {row === undefined ? (
          <DetailsPanel.Skeleton header />
        ) : (
          <>
            <DetailsPanel.Header
              icon={<PrincipalIcon principal={row} size="lg" />}
              title={row.displayName}
              subtitle={principalName(row.key)}
            />
            <DetailsPanel.Skeleton />
          </>
        )}
      </DetailsPanel>
    );
  }

  if (role === undefined) {
    return <DetailsPanel.Empty labelKey={detailsEmptyLabelKey(status, 'roles.details.failed')} />;
  }

  return <RoleDetails role={role} />;
}
