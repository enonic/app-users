import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {Event} from '@enonic/lib-admin-ui/event/Event';
import {ClassHelper} from '@enonic/lib-admin-ui/ClassHelper';
import {IdProvider} from '../principal/IdProvider';

export class UserItemUpdatedEvent
    extends Event {

    private principal: Principal;
    private idProvider: IdProvider;

    constructor(principal: Principal, idProvider: IdProvider) {
        super();
        this.principal = principal;
        this.idProvider = idProvider;
    }

    public getPrincipal(): Principal {
        return this.principal;
    }

    public getIdProvider(): IdProvider {
        return this.idProvider;
    }

    static on(handler: (event: UserItemUpdatedEvent) => void) {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: UserItemUpdatedEvent) => void) {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
