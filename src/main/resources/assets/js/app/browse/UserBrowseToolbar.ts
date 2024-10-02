import {Toolbar, ToolbarConfig} from '@enonic/lib-admin-ui/ui/toolbar/Toolbar';

export class UserBrowseToolbar
    extends Toolbar<ToolbarConfig> {

    constructor() {
        super();
        this.addClass('user-browse-toolbar');
    }
}
