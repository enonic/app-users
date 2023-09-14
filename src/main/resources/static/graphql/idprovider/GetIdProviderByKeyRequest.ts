import {GraphQlRequest} from '../GraphQlRequest';
import {IdProvider} from '../../app/principal/IdProvider';
import {IdProviderJson} from '../../app/principal/IdProviderJson';
import {IdProviderKey} from '@enonic/lib-admin-ui/security/IdProviderKey';

interface GetIdProviderResponse {
    idProvider: IdProviderJson;
}

export class GetIdProviderByKeyRequest
    extends GraphQlRequest<IdProvider> {

    private key: IdProviderKey;

    constructor(key: IdProviderKey) {
        super();
        this.key = key;
    }

    getVariables(): object {
        const vars = super.getVariables();
        vars['key'] = this.key.toString();
        return vars;
    }

    getQuery(): string {
        return `query($key: String!) {
            idProvider(key: $key) {
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
        return this.query().then((result: GetIdProviderResponse) => this.idProviderfromJson(result.idProvider));
    }

    idProviderfromJson(us: IdProviderJson): IdProvider {
        if (!us || Object.keys(us).length === 0) {
            return null;
        }
        if (us.idProviderConfig && typeof us.idProviderConfig.config === 'string') {
            // config is passed as string
            us.idProviderConfig.config = JSON.parse(us.idProviderConfig.config as string);
        }
        return IdProvider.fromJson(us);
    }
}
