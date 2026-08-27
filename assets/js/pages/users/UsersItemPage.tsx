import { useUser } from '../../entities/principal';
import { useItemId } from '../../shared/host';
import { detailsEmptyLabelKey } from '../../widgets/details-panel/details-panel';
import { DetailsEmpty } from '../../widgets/details-panel/DetailsEmpty';
import { UserDetails } from './UserDetails';

export function UsersItemPage() {
  const id = useItemId();
  const { status, item: user } = useUser(id);

  // A user is shown while one is there, including the previous one while the next loads, so stepping
  // through rows does not flash empty. With none, `detailsEmptyLabelKey` picks between the three things
  // an empty column can mean.
  if (user === undefined) {
    return <DetailsEmpty labelKey={detailsEmptyLabelKey(status, 'users.details.failed')} />;
  }

  return <UserDetails user={user} />;
}
