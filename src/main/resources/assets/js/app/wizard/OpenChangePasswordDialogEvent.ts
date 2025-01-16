import {ClassHelper} from '@enonic/lib-admin-ui/ClassHelper';
import {Event} from '@enonic/lib-admin-ui/event/Event';
import {User} from '../principal/User';

export class OpenChangePasswordDialogEvent
    extends Event {

    private readonly principal: User;

    constructor(principal: User) {
        super();
        this.principal = principal;
    }

    getPrincipal(): User {
        return this.principal;
    }

    static on(handler: (event: OpenChangePasswordDialogEvent) => void, contextWindow: Window = window): void {
        Event.bind(ClassHelper.getFullName(this), handler, contextWindow);
    }

    static un(handler?: (event: OpenChangePasswordDialogEvent) => void, contextWindow: Window = window): void {
        Event.unbind(ClassHelper.getFullName(this), handler, contextWindow);
    }
}
