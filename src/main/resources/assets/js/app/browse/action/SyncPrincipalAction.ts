import {UserTreeGridItem} from '../UserTreeGridItem';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {SelectableListBoxWrapper} from '@enonic/lib-admin-ui/ui/selector/list/SelectableListBoxWrapper';

export class SyncPrincipalAction extends Action {

    constructor(selectionWrapper: SelectableListBoxWrapper<UserTreeGridItem>) {
        super(i18n('action.sync'));
        this.setEnabled(false);
        this.onExecuted(() => {
            selectionWrapper.getSelectedItems().forEach((elem) => {
                this.sync(elem);
            });
        });
    }

    private sync(principal: UserTreeGridItem) {
        console.log('Sync principals action');
    }
}
