import {ClassHelper} from 'lib-admin-ui/ClassHelper';
import {Event} from 'lib-admin-ui/event/Event';

export class UserFilteredDataScrollEvent
    extends Event {

    private prevCount: number;
    private count: number;

    constructor(prevCount: number, count: number) {
        super();
        this.prevCount = prevCount;
        this.count = count;
    }

    public getPrevCount(): number {
        return this.prevCount;
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
