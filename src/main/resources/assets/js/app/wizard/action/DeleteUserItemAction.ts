import {DeletePrincipalRequest} from '../../../graphql/principal/DeletePrincipalRequest';
import {DeleteIdProviderRequest} from '../../../graphql/idprovider/DeleteIdProviderRequest';
import {DeletePrincipalResult} from '../../../graphql/principal/DeletePrincipalResult';
import {DeleteIdProviderResult} from '../../../graphql/idprovider/DeleteIdProviderResult';
import {UserItemDeletedEvent} from '../../event/UserItemDeletedEvent';
import {IdProvider} from '../../principal/IdProvider';
import {Principal} from 'lib-admin-ui/security/Principal';
import {UserItem} from 'lib-admin-ui/security/UserItem';
import {Action} from 'lib-admin-ui/ui/Action';
import {WizardPanel} from 'lib-admin-ui/app/wizard/WizardPanel';
import {i18n} from 'lib-admin-ui/util/Messages';
import {ConfirmationDialog} from 'lib-admin-ui/ui/dialog/ConfirmationDialog';
import {showFeedback} from 'lib-admin-ui/notify/MessageBus';

export class DeleteUserItemAction
    extends Action {

    constructor(wizardPanel: WizardPanel<UserItem>) {
        super(i18n('action.delete'), 'mod+del', true);
        const confirmation = new ConfirmationDialog()
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

                                showFeedback(msg);
                                UserItemDeletedEvent.create().setPrincipals([<Principal>persistedItem]).build().fire();
                            }
                        });
                } else {
                    userItemKey = (<IdProvider>persistedItem).getKey();
                    new DeleteIdProviderRequest()
                        .setKeys([userItemKey])
                        .sendAndParse()
                        .done((results: DeleteIdProviderResult[]) => {

                            if (results && results.length > 0) {
                                const keys = results.filter(result => result.isDeleted()).map(result => result.getIdProviderKey());
                                const msg = keys.length === 1 ?
                                            i18n('notify.delete.idprovider.single', keys[0]) :
                                            i18n('notify.delete.idprovider.multiple', keys.length);

                                showFeedback(msg);
                                UserItemDeletedEvent.create().setIdProviders([<IdProvider>persistedItem]).build().fire();
                            }
                        });
                }
            });

        this.onExecuted(() => {
            confirmation.open();
        });
    }
}
