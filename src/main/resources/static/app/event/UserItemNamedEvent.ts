import {Event} from '@enonic/lib-admin-ui/event/Event';
import {ClassHelper} from '@enonic/lib-admin-ui/ClassHelper';
import {UserItemWizardPanel} from '../wizard/UserItemWizardPanel';
import {UserItem} from '@enonic/lib-admin-ui/security/UserItem';

export class UserItemNamedEvent
    extends Event {

    private readonly wizard: UserItemWizardPanel<UserItem>;

    private readonly userItem: UserItem;

    constructor(wizard: UserItemWizardPanel<UserItem>, userItem: UserItem) {
        super();
        this.wizard = wizard;
        this.userItem = userItem;
    }

    public getWizard(): UserItemWizardPanel<UserItem> {
        return this.wizard;
    }

    public getUserItem(): UserItem {
        return this.userItem;
    }

    static on(handler: (event: UserItemNamedEvent) => void): void {
        Event.bind(ClassHelper.getFullName(this), handler);
    }

    static un(handler?: (event: UserItemNamedEvent) => void): void {
        Event.unbind(ClassHelper.getFullName(this), handler);
    }

}

