import '../../../api.ts';
import {UserItemsTreeGrid} from '../UserItemsTreeGrid';
import {UserTreeGridItem, UserTreeGridItemType} from '../UserTreeGridItem';
import {DeletePrincipalRequest} from '../../../api/graphql/principal/DeletePrincipalRequest';
import {DeleteUserStoreRequest} from '../../../api/graphql/userStore/DeleteUserStoreRequest';

import Action = api.ui.Action;
import DeletePrincipalResult = api.security.DeletePrincipalResult;
import ConfirmationDialog = api.ui.dialog.ConfirmationDialog;
import DeleteUserStoreResult = api.security.DeleteUserStoreResult;

export class DeletePrincipalAction
    extends Action {

    constructor(grid: UserItemsTreeGrid) {
        super('Delete', 'mod+del');
        this.setEnabled(false);
        this.onExecuted(() => {
            new ConfirmationDialog()
                .setQuestion('Are you sure you want to delete this user item?')
                .setNoCallback(null)
                .setYesCallback(() => {

                    let principalItems = grid.getSelectedDataList().filter(
                        userItem => UserTreeGridItemType.PRINCIPAL === userItem.getType()).map((userItem: UserTreeGridItem) => {
                        return userItem.getPrincipal();
                    });

                    let userStoreItems = grid.getSelectedDataList().filter(
                        userItem => UserTreeGridItemType.USER_STORE === userItem.getType()).map((userItem: UserTreeGridItem) => {
                        return userItem.getUserStore();
                    });

                    let principalKeys = principalItems.filter((userItem) => {
                        return api.ObjectHelper.iFrameSafeInstanceOf(userItem, api.security.Principal);
                    }).map((principal: api.security.Principal) => {
                        return principal.getKey();
                    });

                    let userStoreKeys = userStoreItems.filter((userItem) => {
                        return api.ObjectHelper.iFrameSafeInstanceOf(userItem, api.security.UserStore);
                    }).map((userStore: api.security.UserStore) => {
                        return userStore.getKey();
                    });

                    if (principalKeys && principalKeys.length > 0) {
                        new DeletePrincipalRequest()
                            .setKeys(principalKeys)
                            .sendAndParse()
                            .done((results: DeletePrincipalResult[]) => {

                                if (results.length > 0) {
                                    let keys = results.filter(result => result.isDeleted())
                                        .map(result => result.getPrincipalKey())
                                        .join(', ');

                                    api.notify.showFeedback('Principal(s) [' + keys + '] deleted!');
                                    api.security.UserItemDeletedEvent.create().setPrincipals(principalItems).build().fire();
                                }
                            });
                    }

                    if (userStoreKeys && userStoreKeys.length > 0) {
                        new DeleteUserStoreRequest()
                            .setKeys(userStoreKeys)
                            .sendAndParse()
                            .done((results: DeleteUserStoreResult[]) => {

                                if (results && results.length > 0) {
                                    let keys = results.filter(result => result.isDeleted())
                                        .map(result => result.getUserStoreKey())
                                        .join(', ');

                                    api.notify.showFeedback('UserStorea [' + keys + '] deleted!');
                                    api.security.UserItemDeletedEvent.create().setUserStores(userStoreItems).build().fire();
                                }
                            });
                    }
                }).open();
        });
    }
}
