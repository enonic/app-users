import {GraphQlRequest} from '../GraphQlRequest';
import {IdProvider} from '../../../app/principal/IdProvider';
import {IdProviderJson} from '../../../app/principal/IdProviderJson';
import IdProviderKey = api.security.IdProviderKey;

export class GetIdProviderByKeyRequest
    extends GraphQlRequest<any, IdProvider> {

    private key: IdProviderKey;

    constructor(key: IdProviderKey) {
        super();
        this.key = key;
    }

    getVariables(): { [key: string]: any } {
        let vars = super.getVariables();
        vars['key'] = this.key.toString();
        return vars;
    }

    getQuery(): string {
        return `query($key: String!) {
            userStore(key: $key) {
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

    sendAndParse(): wemQ.Promise<IdProvider> {
        return this.query().then(result => this.userStorefromJson(result.userStore));
    }

    userStorefromJson(us: IdProviderJson): IdProvider {
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
