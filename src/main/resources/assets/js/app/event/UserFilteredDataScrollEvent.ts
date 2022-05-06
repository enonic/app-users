import {ClassHelper} from 'lib-admin-ui/ClassHelper';
import {Event} from 'lib-admin-ui/event/Event';

export class UserFilteredDataScrollEvent
    extends Event {

    private count: number;

    constructor(count: number) {
        super();
        this.count = count;
    }

    public getCount(): number {
        return this.count;
    }

    static on(handler: (event: UserFilteredDataScrollEvent) => void): void {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: UserFilteredDataScrollEvent) => void): void {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }
}
