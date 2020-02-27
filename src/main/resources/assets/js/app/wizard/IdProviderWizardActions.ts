import {UserItemWizardActions} from './action/UserItemWizardActions';
import {IdProvider} from '../principal/IdProvider';

export class IdProviderWizardActions
    extends UserItemWizardActions<IdProvider> {

    enableActionsForExisting(idProvider: IdProvider) {
        this.save.setEnabled(false);

        if (idProvider.getKey().isSystem()) {
            this.delete.setEnabled(false);
        } else {
            idProvider.isDeletable().then((isDeletable: boolean) => {
                this.delete.setEnabled(isDeletable);
            });
        }
    }

}
