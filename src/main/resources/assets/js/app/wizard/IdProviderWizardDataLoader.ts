import {IdProviderWizardPanelParams} from './IdProviderWizardPanelParams';
import {GetIdProviderByKeyRequest} from '../../api/graphql/userStore/GetIdProviderByKeyRequest';
import {GetDefaultIdProviderRequest} from '../../api/graphql/userStore/GetDefaultIdProviderRequest';
import {IdProvider} from '../principal/IdProvider';

export class IdProviderWizardDataLoader {

    userStore: IdProvider;

    defaultUserStore: IdProvider;

    loadData(params: IdProviderWizardPanelParams): wemQ.Promise<IdProviderWizardDataLoader> {
        if (!params.persistedItem && !params.userStoreKey) {
            return this.loadDataForNew();
        } else {
            return this.loadDataForEdit(params);
        }
    }

    loadDataForEdit(params: IdProviderWizardPanelParams): wemQ.Promise<IdProviderWizardDataLoader> {

        return this.loadDataForNew().then((loader) => {

            return this.loadUserStoreToEdit(params).then((loadedUserStoreToEdit: IdProvider) => {

                this.userStore = loadedUserStoreToEdit;

                return this;
            });
        });
    }

    private loadDataForNew(): wemQ.Promise<IdProviderWizardDataLoader> {

        return this.loadDefaultUserStore().then((defaultUserStore: IdProvider) => {

            this.defaultUserStore = defaultUserStore;

            return this;
        });
    }

    private loadUserStoreToEdit(params: IdProviderWizardPanelParams): wemQ.Promise<IdProvider> {
        if (!params.persistedItem && !!params.userStoreKey) {
            return new GetIdProviderByKeyRequest(params.userStoreKey).sendAndParse();
        } else {
            return wemQ(params.persistedItem);
        }
    }

    private loadDefaultUserStore(): wemQ.Promise<IdProvider> {
        return new GetDefaultIdProviderRequest().sendAndParse();
    }

}
