import {NewPrincipalEvent} from '../NewPrincipalEvent';
import {UserTreeGridItem, UserTreeGridItemType} from '../UserTreeGridItem';
import {UserItemsTreeGrid} from '../UserItemsTreeGrid';
import {ShowNewPrincipalDialogEvent} from '../ShowNewPrincipalDialogEvent';
import {Action} from 'lib-admin-ui/ui/Action';
import {i18n} from 'lib-admin-ui/util/Messages';

export class NewPrincipalAction extends Action {

    constructor(grid: UserItemsTreeGrid) {
        super(i18n('action.new'), 'alt+n');
        this.setEnabled(false);
        this.onExecuted(() => {
            const principals: UserTreeGridItem[] = grid.getSelectedDataList();
            if (principals.length === 1 && principals[0].getType() !== UserTreeGridItemType.ID_PROVIDER) {
                new NewPrincipalEvent(principals).fire();
            } else {
                new ShowNewPrincipalDialogEvent(principals).fire();
            }
        });
    }
}
