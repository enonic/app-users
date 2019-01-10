import Principal = api.security.Principal;
import {IdProvider} from '../principal/IdProvider';

export class UserItemCreatedEvent
    extends api.event.Event {

    private principal: Principal;
    private idProvider: IdProvider;
    private parentOfSameType: boolean;

    constructor(principal: Principal, idProvider: IdProvider, parentOfSameType?: boolean) {
        super();
        this.principal = principal;
        this.idProvider = idProvider;
        this.parentOfSameType = parentOfSameType;
    }

    public getPrincipal(): Principal {
        return this.principal;
    }

    public getIdProvider(): IdProvider {
        return this.idProvider;
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
