import {Event} from '@enonic/lib-admin-ui/event/Event';
import {ClassHelper} from '@enonic/lib-admin-ui/ClassHelper';

export class SetUserPasswordEvent
    extends Event {

    private readonly password: string;

    constructor(password: string) {
        super();
        this.password = password;
    }

    getPassword(): string {
        return this.password;
    }

    static on(handler: (event: SetUserPasswordEvent) => void, contextWindow: Window = window): void {
        Event.bind(ClassHelper.getFullName(this), handler, contextWindow);
    }

    static un(handler?: (event: SetUserPasswordEvent) => void, contextWindow: Window = window): void {
        Event.unbind(ClassHelper.getFullName(this), handler, contextWindow);
    }

}
