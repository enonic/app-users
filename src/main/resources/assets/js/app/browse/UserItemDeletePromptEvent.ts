import {BaseUserEvent} from './BaseUserEvent';
import {Event} from '@enonic/lib-admin-ui/event/Event';
import {ClassHelper} from '@enonic/lib-admin-ui/ClassHelper';

export class UserItemDeletePromptEvent extends BaseUserEvent {

    static on(handler: (event: UserItemDeletePromptEvent) => void): void {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: UserItemDeletePromptEvent) => void): void {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
