import {UserTreeGridItem} from './UserTreeGridItem';
import {Event} from '@enonic/lib-admin-ui/event/Event';
import {ClassHelper} from '@enonic/lib-admin-ui/ClassHelper';

export class ShowNewPrincipalDialogEvent
    extends Event {

    private selection: UserTreeGridItem[];

    constructor(selection: UserTreeGridItem[]) {
        super();
        this.selection = selection;
    }

    getSelection(): UserTreeGridItem[] {
        return this.selection;
    }

    static on(handler: (event: ShowNewPrincipalDialogEvent) => void): void {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: ShowNewPrincipalDialogEvent) => void): void {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
