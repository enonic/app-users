import {ListGraphQlRequest} from '../ListGraphQlRequest';
import {IdProviderListResult} from './IdProviderListResult';
import {IdProvider} from '../../app/principal/IdProvider';
import {IdProviderJson} from '../../app/principal/IdProviderJson';

export class ListIdProvidersRequest
    extends ListGraphQlRequest<IdProvider[]> {

    getQuery(): string {
        return `query {
            idProviders {
                key,
                displayName,
                description,
                idProviderConfig {
                    applicationKey
                    config
                }
                idProviderMode,
                permissions {
                    principal {
                        displayName
                        key
                    }
                    access
                }
            }
        }`;
    }

    sendAndParse(): Q.Promise<IdProvider[]> {
        return this.query().then((response: IdProviderListResult) => {
            return response.idProviders.map(this.idProviderfromJson);
        });
    }

    idProviderfromJson(idprovider: IdProviderJson): IdProvider {
        if (idprovider.idProviderConfig && typeof idprovider.idProviderConfig.config === 'string') {
            // config is passed as string
            idprovider.idProviderConfig.config = JSON.parse(idprovider.idProviderConfig.config as string);
        }
        return IdProvider.fromJson(idprovider);
    }
}
