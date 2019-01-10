import Principal = api.security.Principal;
import {IdProvider} from '../principal/IdProvider';

export class UserItemUpdatedEvent
    extends api.event.Event {

    private principal: Principal;
    private userStore: IdProvider;

    constructor(principal: Principal, userStore: IdProvider) {
        super();
        this.principal = principal;
        this.userStore = userStore;
    }

    public getPrincipal(): Principal {
        return this.principal;
    }

    public getUserStore(): IdProvider {
        return this.userStore;
    }

    static on(handler: (event: UserItemUpdatedEvent) => void) {
        api.event.Event.bind(api.ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: UserItemUpdatedEvent) => void) {
        api.event.Event.unbind(api.ClassHelper.getFullName(this), handler);
    }
}
