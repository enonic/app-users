import { useRole } from '../../entities/principal';
import { useItemId } from '../../shared/host';
import { detailsEmptyLabelKey } from '../../widgets/details-panel/details-panel';
import { DetailsEmpty } from '../../widgets/details-panel/DetailsEmpty';
import { RoleDetails } from './RoleDetails';

export function RolesItemPage() {
  const id = useItemId();
  const { status, item: role } = useRole(id);

  // Three states, never nothing: the panel loads by key, so a selection has to read as under way rather
  // than as a click that did nothing, and a failure says so instead of showing another role's members.
  if (role === undefined) {
    return <DetailsEmpty labelKey={detailsEmptyLabelKey(status, 'roles.details.failed')} />;
  }

  return <RoleDetails role={role} />;
}
