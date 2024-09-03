import {NewPrincipalEvent} from '../NewPrincipalEvent';
import {UserTreeGridItem, UserTreeGridItemType} from '../UserTreeGridItem';
import {ShowNewPrincipalDialogEvent} from '../ShowNewPrincipalDialogEvent';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {SelectableListBoxWrapper} from '@enonic/lib-admin-ui/ui/selector/list/SelectableListBoxWrapper';

export class NewPrincipalAction extends Action {

    constructor(selectionWrapper: SelectableListBoxWrapper<UserTreeGridItem>) {
        super(i18n('action.new'), 'alt+n');
        this.setEnabled(false);
        this.onExecuted(() => {
            const principals: UserTreeGridItem[] = selectionWrapper.getSelectedItems();
            if (principals.length === 1 && principals[0].getType() !== UserTreeGridItemType.ID_PROVIDER) {
                new NewPrincipalEvent(principals).fire();
            } else {
                new ShowNewPrincipalDialogEvent(principals).fire();
            }
        });
    }
}
