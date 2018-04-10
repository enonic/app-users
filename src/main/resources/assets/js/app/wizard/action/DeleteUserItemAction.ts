import '../../../api.ts';
import {DeletePrincipalRequest} from '../../../api/graphql/principal/DeletePrincipalRequest';
import {DeleteUserStoreRequest} from '../../../api/graphql/userStore/DeleteUserStoreRequest';
import UserStore = api.security.UserStore;
import Principal = api.security.Principal;
import UserItem = api.security.UserItem;
import DeletePrincipalResult = api.security.DeletePrincipalResult;
import DeleteUserStoreResult = api.security.DeleteUserStoreResult;
import i18n = api.util.i18n;

export class DeleteUserItemAction extends api.ui.Action {

    constructor(wizardPanel: api.app.wizard.WizardPanel<UserItem>) {
        super(i18n('action.delete'), 'mod+del', true);
        const confirmation = new api.ui.dialog.ConfirmationDialog()
            .setQuestion(i18n('dialog.delete.question'))
            .setNoCallback(null)
            .setYesCallback(() => {

                wizardPanel.close();

                let persistedItem = wizardPanel.getPersistedItem();
                let isPrincipal = !!persistedItem && (persistedItem instanceof Principal);
                let userItemKey;
                if (isPrincipal) {
                    userItemKey = (<Principal>persistedItem).getKey();
                    new DeletePrincipalRequest()
                        .setKeys([userItemKey])
                        .sendAndParse()
                        .done((results: DeletePrincipalResult[]) => {

                            if (results && results.length > 0) {
                                const keys = results.filter(result => result.isDeleted()).map(result => result.getPrincipalKey());
                                const msg = i18n(`notify.delete.principal.${keys.length === 1 ? 'single' : 'multiple'}`, keys.join(', '));

                                api.notify.showFeedback(msg);
                                api.security.UserItemDeletedEvent.create().setPrincipals([<Principal>persistedItem]).build().fire();
                            }
                        });
                } else {
                    userItemKey = (<UserStore>persistedItem).getKey();
                    new DeleteUserStoreRequest()
                        .setKeys([userItemKey])
                        .sendAndParse()
                        .done((results: DeleteUserStoreResult[]) => {

                            if (results && results.length > 0) {
                                const keys = results.filter(result => result.isDeleted()).map(result => result.getUserStoreKey());
                                const msg = keys.length === 1 ?
                                            i18n('notify.delete.userstore.single', keys[0]) :
                                            i18n('notify.delete.userstore.multiple', keys.length);

                                api.notify.showFeedback(msg);
                                api.security.UserItemDeletedEvent.create().setUserStores([<UserStore>persistedItem]).build().fire();
                            }
                        });
                }
            });

        this.onExecuted(() => {
            confirmation.open();
        });
    }
}
