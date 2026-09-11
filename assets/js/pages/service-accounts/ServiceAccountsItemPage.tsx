import { useServiceAccount } from '../../entities/principal';
import { useItemId } from '../../shared/host';
import { detailsEmptyLabelKey } from '../../widgets/details-panel/details-panel';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';
import { ServiceAccountDetails } from './ServiceAccountDetails';

export function ServiceAccountsItemPage() {
  const id = useItemId();
  const { status, item: user } = useServiceAccount(id);

  // Loading with a user on screen is a re-read of that user: it stays.
  if (status === 'loading' && user === undefined) {
    return <DetailsPanel.Skeleton />;
  }

  if (user === undefined) {
    return (
      <DetailsPanel.Empty
        labelKey={detailsEmptyLabelKey(status, 'serviceAccounts.details.failed')}
      />
    );
  }

  return <ServiceAccountDetails user={user} />;
}
