import UserStore = api.security.UserStore;
import Principal = api.security.Principal;

export class UserItemUpdatedEvent
    extends api.event.Event {

    private principal: Principal;
    private userStore: UserStore;

    constructor(principal: Principal, userStore: UserStore) {
        super();
        this.principal = principal;
        this.userStore = userStore;
    }

    public getPrincipal(): Principal {
        return this.principal;
    }

    public getUserStore(): UserStore {
        return this.userStore;
    }

    static on(handler: (event: UserItemUpdatedEvent) => void) {
        api.event.Event.bind(api.ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: UserItemUpdatedEvent) => void) {
        api.event.Event.unbind(api.ClassHelper.getFullName(this), handler);
    }
}
