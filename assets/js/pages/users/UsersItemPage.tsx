import { useUser, useUsers } from '../../entities/principal';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import { useItemId } from '../../shared/host';
import { detailsEmptyLabelKey } from '../../widgets/details-panel/details-panel';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';
import { UserDetails } from './UserDetails';

export function UsersItemPage() {
  const id = useItemId();
  const { status, item: user } = useUser(id);
  const { items } = useUsers();

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
    return <DetailsPanel.Empty labelKey={detailsEmptyLabelKey(status, 'users.details.failed')} />;
  }

  return <UserDetails key={user.key} user={user} />;
}
