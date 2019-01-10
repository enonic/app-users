import Principal = api.security.Principal;
import {IdProvider} from '../principal/IdProvider';

export class UserItemCreatedEvent
    extends api.event.Event {

    private principal: Principal;
    private userStore: IdProvider;
    private parentOfSameType: boolean;

    constructor(principal: Principal, userStore: IdProvider, parentOfSameType?: boolean) {
        super();
        this.principal = principal;
        this.userStore = userStore;
        this.parentOfSameType = parentOfSameType;
    }

    public getPrincipal(): Principal {
        return this.principal;
    }

    public getUserStore(): IdProvider {
        return this.userStore;
    }

    public isParentOfSameType(): boolean {
        return this.parentOfSameType;
    }

    static on(handler: (event: UserItemCreatedEvent) => void) {
        api.event.Event.bind(api.ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: UserItemCreatedEvent) => void) {
        api.event.Event.unbind(api.ClassHelper.getFullName(this), handler);
    }
}
