import '../../../api.ts';
import {DeletePrincipalRequest} from '../../../api/graphql/principal/DeletePrincipalRequest';
import {DeleteUserStoreRequest} from '../../../api/graphql/userStore/DeleteUserStoreRequest';

import UserStore = api.security.UserStore;
import Principal = api.security.Principal;
import UserItem = api.security.UserItem;
import ConfirmationDialog = api.ui.dialog.ConfirmationDialog;
import DeletePrincipalResult = api.security.DeletePrincipalResult;
import DeleteUserStoreResult = api.security.DeleteUserStoreResult;

export class DeleteUserItemAction extends api.ui.Action {

    constructor(wizardPanel: api.app.wizard.WizardPanel<UserItem>) {
        super('Delete', 'mod+del', true);
        this.onExecuted(() => {
            new ConfirmationDialog()
                .setQuestion('Are you sure you want to delete this item?')
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

                                if (results.length > 0) {
                                    let keys = results.filter(result => result.isDeleted())
                                        .map(result => result.getPrincipalKey())
                                        .join(', ');

                                    api.notify.showFeedback('Principal(s) [' + keys + '] deleted!');
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
                                    let keys = results.filter(result => result.isDeleted())
                                        .map(result => result.getUserStoreKey())
                                        .join(', ');

                                    api.notify.showFeedback('UserStore(s) [' + keys + '] deleted!');
                                    api.security.UserItemDeletedEvent.create().setUserStores([<UserStore>persistedItem]).build().fire();
                                }
                            });
                    }
                }).open();
        });
    }
}
