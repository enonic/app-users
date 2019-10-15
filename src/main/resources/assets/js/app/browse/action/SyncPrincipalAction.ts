import {UserItemsTreeGrid} from '../UserItemsTreeGrid';
import {UserTreeGridItem} from '../UserTreeGridItem';
import {Action} from 'lib-admin-ui/ui/Action';
import {i18n} from 'lib-admin-ui/util/Messages';

export class SyncPrincipalAction extends Action {

    constructor(grid: UserItemsTreeGrid) {
        super(i18n('action.sync'));
        this.setEnabled(false);
        this.onExecuted(() => {
            grid.getSelectedDataList().forEach((elem) => {
                this.sync(elem);
            });
        });
    }

    private sync(principal: UserTreeGridItem) {
        console.log('Sync principals action');
    }
}
