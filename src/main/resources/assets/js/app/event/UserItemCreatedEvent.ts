import {Principal} from 'lib-admin-ui/security/Principal';
import {IdProvider} from '../principal/IdProvider';
import {ClassHelper} from 'lib-admin-ui/ClassHelper';
import {Event} from 'lib-admin-ui/event/Event';

export class UserItemCreatedEvent
    extends Event {

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

    static on(handler: (event: UserItemCreatedEvent) => void): void {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: UserItemCreatedEvent) => void): void {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
