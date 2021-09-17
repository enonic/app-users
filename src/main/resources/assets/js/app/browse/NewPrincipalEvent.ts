import {BaseUserEvent} from './BaseUserEvent';
import {ClassHelper} from 'lib-admin-ui/ClassHelper';
import {Event} from 'lib-admin-ui/event/Event';

export class NewPrincipalEvent extends BaseUserEvent {

    static on(handler: (event: NewPrincipalEvent) => void): void {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: NewPrincipalEvent) => void): void {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
