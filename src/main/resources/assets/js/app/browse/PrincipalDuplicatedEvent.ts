import {Principal} from 'lib-admin-ui/security/Principal';
import {Event} from 'lib-admin-ui/event/Event';
import {ClassHelper} from 'lib-admin-ui/ClassHelper';

export class PrincipalDuplicatedEvent
    extends Event {

    private source: Principal;
    private principal: Principal;
    private nextToSource: boolean;

    constructor(principal: Principal, source: Principal, nextToSource: boolean = true) {
        super();
        this.principal = principal;
        this.source = source;
        this.nextToSource = nextToSource;
    }

    getSource(): Principal {
        return this.source;
    }

    getPrincipal(): Principal {
        return this.principal;
    }

    isNextToSource(): boolean {
        return this.nextToSource;
    }

    static on(handler: (event: PrincipalDuplicatedEvent) => void): void {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: PrincipalDuplicatedEvent) => void): void {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
