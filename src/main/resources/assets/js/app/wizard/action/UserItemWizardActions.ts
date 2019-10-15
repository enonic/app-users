import {UserItemWizardPanel} from '../UserItemWizardPanel';
import {DeleteUserItemAction} from './DeleteUserItemAction';
import {UserItem} from 'lib-admin-ui/security/UserItem';
import {WizardActions} from 'lib-admin-ui/app/wizard/WizardActions';
import {Action} from 'lib-admin-ui/ui/Action';
import {SaveAction} from 'lib-admin-ui/app/wizard/SaveAction';
import {CloseAction} from 'lib-admin-ui/app/wizard/CloseAction';

export class UserItemWizardActions<USER_ITEM_TYPE extends UserItem>
    extends WizardActions<USER_ITEM_TYPE> {

    private save: Action;

    private close: Action;

    private delete: Action;

    constructor(wizardPanel: UserItemWizardPanel<USER_ITEM_TYPE>) {
        super();

        this.save = new SaveAction(wizardPanel);
        this.delete = new DeleteUserItemAction(wizardPanel);
        this.close = new CloseAction(wizardPanel);

        this.setActions(this.save, this.delete, this.close);
    }

    enableActionsForNew() {
        this.save.setEnabled(false);
        this.delete.setEnabled(false);
    }

    enableActionsForExisting(userItem: UserItem) {
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
