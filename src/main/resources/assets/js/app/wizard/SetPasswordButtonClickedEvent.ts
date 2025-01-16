import {ClassHelper} from '@enonic/lib-admin-ui/ClassHelper';
import {Event} from '@enonic/lib-admin-ui/event/Event';

export class SetPasswordButtonClickedEvent
    extends Event {

    private readonly showLabel: boolean;

    constructor(showLabel: boolean) {
        super();

        this.showLabel = showLabel;
    }

    isShowLabel(): boolean {
        return this.showLabel;
    }

    static on(handler, contextWindow = window) {
        Event.bind(ClassHelper.getFullName(this), handler, contextWindow);
    }

    static un(handler, contextWindow = window) {
        Event.unbind(ClassHelper.getFullName(this), handler, contextWindow);
    }
}
