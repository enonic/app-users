import {BaseUserEvent} from './BaseUserEvent';
import {ClassHelper} from 'lib-admin-ui/ClassHelper';
import {Event} from 'lib-admin-ui/event/Event';

export class EditPrincipalEvent extends BaseUserEvent {

    static on(handler: (event: EditPrincipalEvent) => void) {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: EditPrincipalEvent) => void) {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
