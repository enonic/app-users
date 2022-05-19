import {ClassHelper} from 'lib-admin-ui/ClassHelper';
import {Event} from 'lib-admin-ui/event/Event';

export class UserItemsStopScrollEvent
    extends Event {

    static on(handler: (event: UserItemsStopScrollEvent) => void): void {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: UserItemsStopScrollEvent) => void): void {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
