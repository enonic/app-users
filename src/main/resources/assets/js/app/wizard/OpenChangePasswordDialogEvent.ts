import {Principal} from 'lib-admin-ui/security/Principal';
import {ClassHelper} from 'lib-admin-ui/ClassHelper';
import {Event} from 'lib-admin-ui/event/Event';

export class OpenChangePasswordDialogEvent
    extends Event {

    private principal: Principal;

    constructor(principal: Principal) {
        super();
        this.principal = principal;
    }

    getPrincipal(): Principal {
        return this.principal;
    }

    static on(handler: (event: OpenChangePasswordDialogEvent) => void, contextWindow: Window = window): void {
        Event.bind(ClassHelper.getFullName(this), handler, contextWindow);
    }

    static un(handler?: (event: OpenChangePasswordDialogEvent) => void, contextWindow: Window = window): void {
        Event.unbind(ClassHelper.getFullName(this), handler, contextWindow);
    }
}
