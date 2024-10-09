import {EditPrincipalEvent} from '../EditPrincipalEvent';
import {UserTreeGridItem} from '../UserTreeGridItem';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {SelectableListBoxWrapper} from '@enonic/lib-admin-ui/ui/selector/list/SelectableListBoxWrapper';

export class EditPrincipalAction extends Action {

    constructor(selectionWrapper: SelectableListBoxWrapper<UserTreeGridItem>) {
        super(i18n('action.edit'), 'mod+e');
        this.setEnabled(false);
        this.onExecuted(() => {
            let principals: UserTreeGridItem[] = selectionWrapper.getSelectedItems();
            new EditPrincipalEvent(principals).fire();
        });
    }
}
