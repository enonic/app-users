import {Principal} from 'lib-admin-ui/security/Principal';
import {Event} from 'lib-admin-ui/event/Event';
import {IdProvider} from '../principal/IdProvider';
import {ClassHelper} from 'lib-admin-ui/ClassHelper';

export class UserItemDeletedEvent
    extends Event {

    private principals: Principal[];

    private idProviders: IdProvider[];

    constructor(builder: UserItemDeletedEventBuilder) {
        super();
        this.principals = builder.principals;
        this.idProviders = builder.idProviders;
    }

    public getPrincipals(): Principal[] {
        return this.principals;
    }

    public getIdProviders(): IdProvider[] {
        return this.idProviders;
    }

    public static create(): UserItemDeletedEventBuilder {
        return new UserItemDeletedEventBuilder();
    }

    static on(handler: (event: UserItemDeletedEvent) => void): void {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: UserItemDeletedEvent) => void): void {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}

export class UserItemDeletedEventBuilder {

    principals: Principal[];

    idProviders: IdProvider[];

    setPrincipals(principals: Principal[]): UserItemDeletedEventBuilder {
        this.principals = principals;
        return this;
    }

    setIdProviders(idProviders: IdProvider[]): UserItemDeletedEventBuilder {
        this.idProviders = idProviders;
        return this;
    }

    build(): UserItemDeletedEvent {
        return new UserItemDeletedEvent(this);
    }
}
