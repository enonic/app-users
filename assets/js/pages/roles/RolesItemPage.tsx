import { principalName, useRole, useRoles } from '../../entities/principal';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import { useItemId } from '../../shared/host';
import { detailsEmptyLabelKey } from '../../widgets/details-panel/details-panel';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';
import { RoleDetails } from './RoleDetails';

type RolesItemPageProps = {
  'data-component'?: string;
};

const ROLES_ITEM_PAGE_NAME = 'RolesItemPage';

export function RolesItemPage({
  'data-component': componentName = ROLES_ITEM_PAGE_NAME,
}: RolesItemPageProps) {
  const id = useItemId();
  const { status, item: role } = useRole(id);
  const { items } = useRoles();

  // Loading with a role on screen is a re-read of that role: it stays.
  if (status === 'loading' && role === undefined) {
    const row = items.find(({ key }) => key === id);

    return (
      <DetailsPanel data-component={componentName}>
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
    return (
      <DetailsPanel.Empty
        data-component={componentName}
        labelKey={detailsEmptyLabelKey(status, 'roles.details.failed')}
      />
    );
  }

  return <RoleDetails key={role.key} role={role} />;
}

RolesItemPage.displayName = ROLES_ITEM_PAGE_NAME;
