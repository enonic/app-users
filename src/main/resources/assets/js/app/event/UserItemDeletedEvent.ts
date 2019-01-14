import Principal = api.security.Principal;
import {IdProvider} from '../principal/IdProvider';

export class UserItemDeletedEvent
    extends api.event.Event {

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

    static on(handler: (event: UserItemDeletedEvent) => void) {
        api.event.Event.bind(api.ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: UserItemDeletedEvent) => void) {
        api.event.Event.unbind(api.ClassHelper.getFullName(this), handler);
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
