import Principal = api.security.Principal;
import {IdProvider} from '../principal/IdProvider';

export class UserItemUpdatedEvent
    extends api.event.Event {

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
        api.event.Event.bind(api.ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: UserItemUpdatedEvent) => void) {
        api.event.Event.unbind(api.ClassHelper.getFullName(this), handler);
    }
}
