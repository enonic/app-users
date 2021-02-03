import {ItemStatisticsHeader} from 'lib-admin-ui/app/view/ItemStatisticsHeader';
import {UserTreeGridItem, UserTreeGridItemType} from '../browse/UserTreeGridItem';

export class UserItemStatisticsHeader
    extends ItemStatisticsHeader {

    setItem(item: UserTreeGridItem): void {
        super.setItem(item);

        if (!!item && item.getType() === UserTreeGridItemType.PRINCIPAL) {
            this.appendToHeaderPath(item.getPrincipal().getKey().toPath(true), 'parent-path');
            this.appendToHeaderPath(item.getPrincipal().getKey().getId(), 'path-name');
        }

    }

    protected getIconSize(item: UserTreeGridItem): number {
        return item.getType() === UserTreeGridItemType.PRINCIPAL ? 128 : super.getIconSize(item);
    }
}
