import {IdProviderWizardPanelParams} from './IdProviderWizardPanelParams';
import {GetIdProviderByKeyRequest} from '../../api/graphql/idProvider/GetIdProviderByKeyRequest';
import {GetDefaultIdProviderRequest} from '../../api/graphql/idProvider/GetDefaultIdProviderRequest';
import {IdProvider} from '../principal/IdProvider';

export class IdProviderWizardDataLoader {

    idProvider: IdProvider;

    defaultIdProvider: IdProvider;

    loadData(params: IdProviderWizardPanelParams): wemQ.Promise<IdProviderWizardDataLoader> {
        if (!params.persistedItem && !params.idProviderKey) {
            return this.loadDataForNew();
        } else {
            return this.loadDataForEdit(params);
        }
    }

    loadDataForEdit(params: IdProviderWizardPanelParams): wemQ.Promise<IdProviderWizardDataLoader> {

        return this.loadDataForNew().then((loader) => {

            return this.loadIdProviderToEdit(params).then((loadedIdProviderToEdit: IdProvider) => {

                this.idProvider = loadedIdProviderToEdit;

                return this;
            });
        });
    }

    private loadDataForNew(): wemQ.Promise<IdProviderWizardDataLoader> {

        return this.loadDefaultIdProvider().then((defaultIdProvider: IdProvider) => {

            this.defaultIdProvider = defaultIdProvider;

            return this;
        });
    }

    private loadIdProviderToEdit(params: IdProviderWizardPanelParams): wemQ.Promise<IdProvider> {
        if (!params.persistedItem && !!params.idProviderKey) {
            return new GetIdProviderByKeyRequest(params.idProviderKey).sendAndParse();
        } else {
            return wemQ(params.persistedItem);
        }
    }

    private loadDefaultIdProvider(): wemQ.Promise<IdProvider> {
        return new GetDefaultIdProviderRequest().sendAndParse();
    }

}
