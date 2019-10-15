import {EditPrincipalEvent} from '../EditPrincipalEvent';
import {UserTreeGridItem} from '../UserTreeGridItem';
import {UserItemsTreeGrid} from '../UserItemsTreeGrid';
import {Action} from 'lib-admin-ui/ui/Action';
import {i18n} from 'lib-admin-ui/util/Messages';

export class EditPrincipalAction extends Action {

    constructor(grid: UserItemsTreeGrid) {
        super(i18n('action.edit'), 'f4');
        this.setEnabled(false);
        this.onExecuted(() => {
            let principals: UserTreeGridItem[] = grid.getSelectedDataList();
            new EditPrincipalEvent(principals).fire();
        });
    }
}
