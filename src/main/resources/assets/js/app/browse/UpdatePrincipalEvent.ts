import {Principal} from 'lib-admin-ui/security/Principal';
import {Event} from 'lib-admin-ui/event/Event';
import {ClassHelper} from 'lib-admin-ui/ClassHelper';

export class UpdatePrincipalEvent extends Event {
    private principals: Principal[];

    constructor(principals: Principal[]) {
        super();
        this.principals = principals;
    }

    getPrincipals(): Principal[] {
        return this.principals;
    }

    static on(handler: (event: UpdatePrincipalEvent) => void): void {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: UpdatePrincipalEvent) => void): void {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
