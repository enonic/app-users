import {Principal} from 'lib-admin-ui/security/Principal';
import {Event} from 'lib-admin-ui/event/Event';
import {ClassHelper} from 'lib-admin-ui/ClassHelper';

export class PrincipalSynchronizedEvent
    extends Event {

    private principal: Principal;

    constructor(principal: Principal) {
        super();
        this.principal = principal;

    }

    getPrincipal(): Principal {
        return this.principal;
    }

    static on(handler: (event: PrincipalSynchronizedEvent) => void) {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: PrincipalSynchronizedEvent) => void) {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
