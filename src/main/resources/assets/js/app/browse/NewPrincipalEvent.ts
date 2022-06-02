import {BaseUserEvent} from './BaseUserEvent';
import {ClassHelper} from '@enonic/lib-admin-ui/ClassHelper';
import {Event} from '@enonic/lib-admin-ui/event/Event';

export class NewPrincipalEvent extends BaseUserEvent {

    static on(handler: (event: NewPrincipalEvent) => void): void {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: NewPrincipalEvent) => void): void {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
