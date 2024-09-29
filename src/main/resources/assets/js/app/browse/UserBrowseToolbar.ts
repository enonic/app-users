import {Toolbar, ToolbarConfig} from '@enonic/lib-admin-ui/ui/toolbar/Toolbar';
import {UserTreeGridActions} from './UserTreeGridActions';

export class UserBrowseToolbar
    extends Toolbar<ToolbarConfig> {

    constructor(actions: UserTreeGridActions) {
        super();
        this.addClass('user-browse-toolbar');
        this.addActions(actions.getAllActions());
    }
}
