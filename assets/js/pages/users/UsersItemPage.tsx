import { useUser } from '../../entities/principal';
import { useItemId } from '../../shared/host';
import { detailsEmptyLabelKey } from '../../widgets/details-panel/details-panel';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';
import { UserDetails } from './UserDetails';

export function UsersItemPage() {
  const id = useItemId();
  const { status, item: user } = useUser(id);

  // Loading with a user on screen is a re-read of that user: it stays.
  if (status === 'loading' && user === undefined) {
    return <DetailsPanel.Skeleton />;
  }

  if (user === undefined) {
    return <DetailsPanel.Empty labelKey={detailsEmptyLabelKey(status, 'users.details.failed')} />;
  }

  return <UserDetails user={user} />;
}
