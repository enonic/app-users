import {GraphQlRequest} from '../GraphQlRequest';
import {IdProvider} from '../../app/principal/IdProvider';
import {IdProviderJson} from '../../app/principal/IdProviderJson';

export class GetDefaultIdProviderRequest
    extends GraphQlRequest<any, IdProvider> {

    getQuery(): string {
        return `query {
            defaultIdProvider {
                key
                displayName
                description
                idProviderMode
                idProviderConfig {
                    applicationKey
                    config
                }
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

    sendAndParse(): Q.Promise<IdProvider> {
        return this.query().then(result => this.idProviderfromJson(result.defaultIdProvider));
    }

    idProviderfromJson(us: IdProviderJson): IdProvider {
        if (!us || Object.keys(us).length === 0) {
            return null;
        }
        if (us.idProviderConfig && typeof us.idProviderConfig.config === 'string') {
            // config is passed as string
            us.idProviderConfig.config = JSON.parse(<string>us.idProviderConfig.config);
        }
        return IdProvider.fromJson(us);
    }
}
