import {UserItemStatisticsPanel} from '../view/UserItemStatisticsPanel';
import {BrowseItemPanel} from '@enonic/lib-admin-ui/app/browse/BrowseItemPanel';
import {ItemStatisticsPanel} from '@enonic/lib-admin-ui/app/view/ItemStatisticsPanel';

export class UserBrowseItemPanel
    extends BrowseItemPanel {

    createItemStatisticsPanel(): ItemStatisticsPanel {
        return new UserItemStatisticsPanel();
    }

}
