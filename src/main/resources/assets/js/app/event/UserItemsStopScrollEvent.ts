import {ClassHelper} from '@enonic/lib-admin-ui/ClassHelper';
import {Event} from '@enonic/lib-admin-ui/event/Event';

export class UserItemsStopScrollEvent
    extends Event {

    static on(handler: (event: UserItemsStopScrollEvent) => void): void {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: UserItemsStopScrollEvent) => void): void {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
