import {UserTreeGridActions} from './UserTreeGridActions';
import {Toolbar} from '@enonic/lib-admin-ui/ui/toolbar/Toolbar';

export class UserBrowseToolbar
    extends Toolbar {

    constructor(actions: UserTreeGridActions) {
        super();
        this.addClass('user-browse-toolbar');
        this.addActions(actions.getAllActions());
    }
}
