import {UserItemWizardPanel} from '../UserItemWizardPanel';
import {DeleteUserItemAction} from './DeleteUserItemAction';
import {UserItem} from '@enonic/lib-admin-ui/security/UserItem';
import {WizardActions} from '@enonic/lib-admin-ui/app/wizard/WizardActions';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {SaveAction} from '@enonic/lib-admin-ui/app/wizard/SaveAction';
import {CloseAction} from '@enonic/lib-admin-ui/app/wizard/CloseAction';

export class UserItemWizardActions<USER_ITEM_TYPE extends UserItem>
    extends WizardActions<USER_ITEM_TYPE> {

    protected save: Action;

    protected close: Action;

    protected delete: Action;

    constructor(wizardPanel: UserItemWizardPanel<USER_ITEM_TYPE>) {
        super();

        this.save = new SaveAction(wizardPanel);
        this.delete = new DeleteUserItemAction();
        this.close = new CloseAction(wizardPanel);

        this.setActions(this.save, this.delete, this.close);
    }

    enableActionsForNew(): void {
        this.save.setEnabled(false);
        this.delete.setEnabled(false);
    }

    enableActionsForExisting(userItem: UserItem): void {
        this.save.setEnabled(false);
        this.delete.setEnabled(!userItem.getKey().isSystem());
    }

    getDeleteAction(): Action {
        return this.delete;
    }

    getSaveAction(): Action {
        return this.save;
    }

    getCloseAction(): Action {
        return this.close;
    }

}
