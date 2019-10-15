import {BaseUserEvent} from './BaseUserEvent';
import {Event} from 'lib-admin-ui/event/Event';
import {ClassHelper} from 'lib-admin-ui/ClassHelper';

export class UserItemDeletePromptEvent extends BaseUserEvent {

    static on(handler: (event: UserItemDeletePromptEvent) => void) {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: UserItemDeletePromptEvent) => void) {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
