import { principalName, useGroup, useGroups, useIdProviderNames } from '../../entities/principal';
import { PrincipalIcon } from '../../entities/principal/ui/PrincipalIcon';
import { useItemId } from '../../shared/host';
import { detailsEmptyLabelKey } from '../../widgets/details-panel/details-panel';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';
import { GroupDetails } from './GroupDetails';

type GroupsItemPageProps = {
  'data-component'?: string;
};

const GROUPS_ITEM_PAGE_NAME = 'GroupsItemPage';

export function GroupsItemPage({
  'data-component': componentName = GROUPS_ITEM_PAGE_NAME,
}: GroupsItemPageProps) {
  const id = useItemId();
  const { status, item: group } = useGroup(id);
  const { items } = useGroups();
  const providers = useIdProviderNames();

  // The panel's edit buttons follow the providers' modes, so a group shown before the providers are known
  // would flash locked; a re-read of the list keeps what it has and does not count.
  const providersPending = providers.status === 'loading' && providers.items.length === 0;

  // Loading with a group on screen is a re-read of that group: it stays.
  if ((status === 'loading' && group === undefined) || providersPending) {
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
              subtitle={principalName(row.key)}
            />
            <DetailsPanel.Skeleton />
          </>
        )}
      </DetailsPanel>
    );
  }

  if (group === undefined) {
    return (
      <DetailsPanel.Empty
        data-component={componentName}
        labelKey={detailsEmptyLabelKey(status, 'groups.details.failed')}
      />
    );
  }

  return <GroupDetails key={group.key} group={group} />;
}

GroupsItemPage.displayName = GROUPS_ITEM_PAGE_NAME;
