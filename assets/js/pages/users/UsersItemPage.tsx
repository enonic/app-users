import { useUser, useUsers } from '../../entities/principal';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import { useItemId } from '../../shared/host';
import { detailsEmptyLabelKey } from '../../widgets/details-panel/details-panel';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';
import { UserDetails } from './UserDetails';

type UsersItemPageProps = {
  'data-component'?: string;
};

const USERS_ITEM_PAGE_NAME = 'UsersItemPage';

export function UsersItemPage({
  'data-component': componentName = USERS_ITEM_PAGE_NAME,
}: UsersItemPageProps) {
  const id = useItemId();
  const { status, item: user } = useUser(id);
  const { items } = useUsers();

  // Loading with a user on screen is a re-read of that user: it stays.
  if (status === 'loading' && user === undefined) {
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
        data-component={componentName}
        labelKey={detailsEmptyLabelKey(status, 'users.details.failed')}
      />
    );
  }

  return <UserDetails key={user.key} user={user} />;
}

UsersItemPage.displayName = USERS_ITEM_PAGE_NAME;
