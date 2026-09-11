import { useRole } from '../../entities/principal';
import { useItemId } from '../../shared/host';
import { detailsEmptyLabelKey } from '../../widgets/details-panel/details-panel';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';
import { RoleDetails } from './RoleDetails';

export function RolesItemPage() {
  const id = useItemId();
  const { status, item: role } = useRole(id);

  // Loading with a role on screen is a re-read of that role: it stays.
  if (status === 'loading' && role === undefined) {
    return <DetailsPanel.Skeleton />;
  }

  if (role === undefined) {
    return <DetailsPanel.Empty labelKey={detailsEmptyLabelKey(status, 'roles.details.failed')} />;
  }

  return <RoleDetails role={role} />;
}
