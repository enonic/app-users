import {UserTreeGridItem} from './UserTreeGridItem';
import {UserItemStatisticsPanel} from '../view/UserItemStatisticsPanel';
import {BrowseItemPanel} from 'lib-admin-ui/app/browse/BrowseItemPanel';
import {ItemStatisticsPanel} from 'lib-admin-ui/app/view/ItemStatisticsPanel';

export class UserBrowseItemPanel
    extends BrowseItemPanel<UserTreeGridItem> {

    createItemStatisticsPanel(): ItemStatisticsPanel<UserTreeGridItem> {
        return new UserItemStatisticsPanel();
    }

}
