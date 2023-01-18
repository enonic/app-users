import {ItemStatisticsHeader} from '@enonic/lib-admin-ui/app/view/ItemStatisticsHeader';
import {UserTreeGridItem, UserTreeGridItemType} from '../browse/UserTreeGridItem';

export class UserItemStatisticsHeader
    extends ItemStatisticsHeader {

    setItem(item: UserTreeGridItem): void {
        super.setItem(item);

        if (item?.getType() === UserTreeGridItemType.PRINCIPAL) {
            this.appendToHeaderPath(item.getPrincipal().getKey().toPath(true), 'parent-path');
            this.appendToHeaderPath(item.getPrincipal().getKey().getId(), 'path-name');
        }

    }

    protected getIconSize(): number {
        return (<UserTreeGridItem>this.browseItem)?.getType() === UserTreeGridItemType.PRINCIPAL ? 128 : super.getIconSize();
    }
}
