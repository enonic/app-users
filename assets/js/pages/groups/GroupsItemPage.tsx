import { useGroup } from '../../entities/principal';
import { useItemId } from '../../shared/host';
import { detailsEmptyLabelKey } from '../../widgets/details-panel/details-panel';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';
import { GroupDetails } from './GroupDetails';

export function GroupsItemPage() {
  const id = useItemId();
  const { status, item: group } = useGroup(id);

  // Loading with a group on screen is a re-read of that group: it stays.
  if (status === 'loading' && group === undefined) {
    return <DetailsPanel.Skeleton />;
  }

  if (group === undefined) {
    return <DetailsPanel.Empty labelKey={detailsEmptyLabelKey(status, 'groups.details.failed')} />;
  }

  return <GroupDetails group={group} />;
}
