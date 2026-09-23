import { useServiceAccount, useServiceAccounts } from '../../entities/principal';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import { useItemId } from '../../shared/host';
import { detailsEmptyLabelKey } from '../../widgets/details-panel/details-panel';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';
import { ServiceAccountDetails } from './ServiceAccountDetails';

export function ServiceAccountsItemPage() {
  const id = useItemId();
  const { status, item: user } = useServiceAccount(id);
  const { items } = useServiceAccounts();

  // Loading with a user on screen is a re-read of that user: it stays.
  if (status === 'loading' && user === undefined) {
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
              subtitle={row.login}
            />
            <DetailsPanel.Skeleton />
          </>
        )}
      </DetailsPanel>
    );
  }

  if (user === undefined) {
    return (
      <DetailsPanel.Empty
        labelKey={detailsEmptyLabelKey(status, 'serviceAccounts.details.failed')}
      />
    );
  }

  return <ServiceAccountDetails key={user.key} user={user} />;
}
