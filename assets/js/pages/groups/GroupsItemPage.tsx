import { principalName, useGroup, useGroups } from '../../entities/principal';
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

  // Loading with a group on screen is a re-read of that group: it stays.
  if (status === 'loading' && group === undefined) {
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
