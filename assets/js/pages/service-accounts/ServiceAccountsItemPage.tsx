import { useServiceAccount } from '../../entities/principal';
import { useItemId } from '../../shared/host';
import { detailsEmptyLabelKey } from '../../widgets/details-panel/details-panel';
import { DetailsEmpty } from '../../widgets/details-panel/DetailsEmpty';
import { ServiceAccountDetails } from './ServiceAccountDetails';

export function ServiceAccountsItemPage() {
  const id = useItemId();
  const { status, item: user } = useServiceAccount(id);

  // An account is shown while one is there, including the previous one while the next loads, so stepping
  // through rows does not flash empty. With none, `detailsEmptyLabelKey` picks between the three things
  // an empty column can mean.
  if (user === undefined) {
    return (
      <DetailsEmpty labelKey={detailsEmptyLabelKey(status, 'serviceAccounts.details.failed')} />
    );
  }

  return <ServiceAccountDetails user={user} />;
}
