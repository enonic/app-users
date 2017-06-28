import '../../../api.ts';
import {DeletePrincipalRequest} from '../../../api/graphql/principal/DeletePrincipalRequest';

import UserStore = api.security.UserStore;
import Principal = api.security.Principal;
import UserItem = api.security.UserItem;
import ConfirmationDialog = api.ui.dialog.ConfirmationDialog;
import DeletePrincipalResult = api.security.DeletePrincipalResult;

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
                                    let keys = results.reduce((prev, result) => {
                                        if (result.isDeleted()) {
                                            prev.push(result.getPrincipalKey().toString());
                                        }
                                        return prev;
                                    }, []).join(', ');

                                    api.notify.showFeedback('Principal(s) [' + keys + '] deleted!');
                                    api.security.UserItemDeletedEvent.create().setPrincipals([<Principal>persistedItem]).build().fire();
                                }
                            });
                    } else {
                        userItemKey = (<UserStore>persistedItem).getKey();
                        new api.security.DeleteUserStoreRequest()
                            .setKeys([userItemKey])
                            .send()
                            .done((jsonResponse: api.rest.JsonResponse<any>) => {
                                let json = jsonResponse.getJson();

                                if (json.results && json.results.length > 0) {
                                    let key = json.results[0].userStoreKey;

                                    api.notify.showFeedback('UserStore [' + key + '] deleted!');
                                    api.security.UserItemDeletedEvent.create().setUserStores([<UserStore>persistedItem]).build().fire();
                                }
                            });
                    }
                }).open();
        });
    }
}
