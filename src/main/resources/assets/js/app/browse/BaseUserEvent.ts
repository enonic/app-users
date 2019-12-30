import {UserTreeGridItem} from './UserTreeGridItem';
import {Event} from 'lib-admin-ui/event/Event';

export class BaseUserEvent
    extends Event {

    private gridItems: UserTreeGridItem[];

    constructor(gridItems: UserTreeGridItem[]) {
        super();

        this.gridItems = gridItems;
    }

    getPrincipals(): UserTreeGridItem[] {
        return this.gridItems;
    }
}
