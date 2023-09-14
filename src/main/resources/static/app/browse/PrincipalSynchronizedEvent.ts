import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {Event} from '@enonic/lib-admin-ui/event/Event';
import {ClassHelper} from '@enonic/lib-admin-ui/ClassHelper';

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

    static on(handler: (event: PrincipalSynchronizedEvent) => void): void {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: PrincipalSynchronizedEvent) => void): void {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
