import Principal = api.security.Principal;
import {IdProvider} from '../principal/IdProvider';

export class UserItemDeletedEvent
    extends api.event.Event {

    private principals: Principal[];

    private userStores: IdProvider[];

    constructor(builder: UserItemDeletedEventBuilder) {
        super();
        this.principals = builder.principals;
        this.userStores = builder.userStores;
    }

    public getPrincipals(): Principal[] {
        return this.principals;
    }

    public getUserStores(): IdProvider[] {
        return this.userStores;
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

    userStores: IdProvider[];

    setPrincipals(principals: Principal[]): UserItemDeletedEventBuilder {
        this.principals = principals;
        return this;
    }

    setUserStores(userStores: IdProvider[]): UserItemDeletedEventBuilder {
        this.userStores = userStores;
        return this;
    }

    build(): UserItemDeletedEvent {
        return new UserItemDeletedEvent(this);
    }
}
