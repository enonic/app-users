import {UserItemsTreeGrid} from '../UserItemsTreeGrid';
import {UserTreeGridItem, UserTreeGridItemType} from '../UserTreeGridItem';
import {DeletePrincipalRequest} from '../../../graphql/principal/DeletePrincipalRequest';
import {DeleteIdProviderRequest} from '../../../graphql/idprovider/DeleteIdProviderRequest';
import {DeletePrincipalResult} from '../../../graphql/principal/DeletePrincipalResult';
import {DeleteIdProviderResult} from '../../../graphql/idprovider/DeleteIdProviderResult';
import {UserItemDeletedEvent} from '../../event/UserItemDeletedEvent';
import {IdProvider} from '../../principal/IdProvider';
import {Action} from 'lib-admin-ui/ui/Action';
import {Principal} from 'lib-admin-ui/security/Principal';
import {ConfirmationDialog} from 'lib-admin-ui/ui/dialog/ConfirmationDialog';
import {i18n} from 'lib-admin-ui/util/Messages';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {showFeedback} from 'lib-admin-ui/notify/MessageBus';

export class DeletePrincipalAction
    extends Action {

    constructor(grid: UserItemsTreeGrid) {
        super(i18n('action.delete'), 'mod+del');
        this.setEnabled(false);
        const confirmation = new ConfirmationDialog()
            .setQuestion(i18n('dialog.delete.question'))
            .setNoCallback(null)
            .setYesCallback(() => {

                let principalItems = grid.getSelectedDataList().filter(
                    userItem => UserTreeGridItemType.PRINCIPAL === userItem.getType()).map((userItem: UserTreeGridItem) => {
                    return userItem.getPrincipal();
                });

                let idProviderItems = grid.getSelectedDataList().filter(
                    userItem => UserTreeGridItemType.ID_PROVIDER === userItem.getType()).map((userItem: UserTreeGridItem) => {
                    return userItem.getIdProvider();
                });

                let principalKeys = principalItems.filter((userItem) => {
                    return ObjectHelper.iFrameSafeInstanceOf(userItem, Principal);
                }).map((principal: Principal) => {
                    return principal.getKey();
                });

                let idProviderKeys = idProviderItems.filter((userItem) => {
                    return ObjectHelper.iFrameSafeInstanceOf(userItem, IdProvider);
                }).map((idProvider: IdProvider) => {
                    return idProvider.getKey();
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

                                showFeedback(msg);
                                UserItemDeletedEvent.create().setPrincipals(principalItems).build().fire();
                            }
                        });
                }

                if (idProviderKeys && idProviderKeys.length > 0) {
                    new DeleteIdProviderRequest()
                        .setKeys(idProviderKeys)
                        .sendAndParse()
                        .done((results: DeleteIdProviderResult[]) => {
                            if (results && results.length > 0) {
                                showFeedback(i18n('notify.delete.idprovider.single', results[0].getIdProviderKey()));
                                UserItemDeletedEvent.create().setIdProviders(idProviderItems).build().fire();
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
