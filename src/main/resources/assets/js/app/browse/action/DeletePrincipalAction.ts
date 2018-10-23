import {UserItemsTreeGrid} from '../UserItemsTreeGrid';
import {UserTreeGridItem, UserTreeGridItemType} from '../UserTreeGridItem';
import {DeletePrincipalRequest} from '../../../api/graphql/principal/DeletePrincipalRequest';
import {DeleteUserStoreRequest} from '../../../api/graphql/userStore/DeleteUserStoreRequest';
import {DeletePrincipalResult} from '../../../api/graphql/principal/DeletePrincipalResult';
import {DeleteUserStoreResult} from '../../../api/graphql/userStore/DeleteUserStoreResult';
import {UserItemDeletedEvent} from '../../event/UserItemDeletedEvent';
import {UserStore} from '../../principal/UserStore';
import Action = api.ui.Action;
import Principal = api.security.Principal;
import i18n = api.util.i18n;

export class DeletePrincipalAction
    extends Action {

    constructor(grid: UserItemsTreeGrid) {
        super(i18n('action.delete'), 'mod+del');
        this.setEnabled(false);
        const confirmation = new api.ui.dialog.ConfirmationDialog()
            .setQuestion(i18n('dialog.delete.question'))
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
                    return api.ObjectHelper.iFrameSafeInstanceOf(userItem, Principal);
                }).map((principal: Principal) => {
                    return principal.getKey();
                });

                let userStoreKeys = userStoreItems.filter((userItem) => {
                    return api.ObjectHelper.iFrameSafeInstanceOf(userItem, UserStore);
                }).map((userStore: UserStore) => {
                    return userStore.getKey();
                });

                if (principalKeys && principalKeys.length > 0) {
                    new DeletePrincipalRequest()
                        .setKeys(principalKeys)
                        .sendAndParse()
                        .done((results: DeletePrincipalResult[]) => {

                            if (results.length > 0) {
                                const keys = results.filter(result => result.isDeleted()).map(result => result.getPrincipalKey());
                                const msg = keys.length === 1 ?
                                            i18n('notify.delete.principal.single', keys[0]) :
                                            i18n('notify.delete.principal.multiple', keys.length);

                                api.notify.showFeedback(msg);
                                UserItemDeletedEvent.create().setPrincipals(principalItems).build().fire();
                            }
                        });
                }

                if (userStoreKeys && userStoreKeys.length > 0) {
                    new DeleteUserStoreRequest()
                        .setKeys(userStoreKeys)
                        .sendAndParse()
                        .done((results: DeleteUserStoreResult[]) => {
                            if (results && results.length > 0) {
                                api.notify.showFeedback(i18n('notify.delete.userstore.single', results[0].getUserStoreKey()));
                                UserItemDeletedEvent.create().setUserStores(userStoreItems).build().fire();
                            }
                        });

                }
            });

        this.onExecuted(() => {
            const multiple = grid.getSelectedDataList().length > 1;
            const question = multiple ? i18n('dialog.delete.multiple.question') : i18n('dialog.delete.question');
            confirmation.setQuestion(question).open();
        });
    }
}
