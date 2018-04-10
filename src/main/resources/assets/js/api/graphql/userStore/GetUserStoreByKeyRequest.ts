import UserStore = api.security.UserStore;
import UserStoreJson = api.security.UserStoreJson;
import UserStoreKey = api.security.UserStoreKey;
import {GraphQlRequest} from '../GraphQlRequest';

export class GetUserStoreByKeyRequest
    extends GraphQlRequest<any, UserStore> {

    private key: UserStoreKey;

    constructor(key: api.security.UserStoreKey) {
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
                authConfig {
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

    sendAndParse(): wemQ.Promise<UserStore> {
        return this.query().then(result => this.userStorefromJson(result.userStore));
    }

    userStorefromJson(us: UserStoreJson): UserStore {
        if (!us || Object.keys(us).length === 0) {
            return null;
        }
        if (us.authConfig && typeof us.authConfig.config === 'string') {
            // config is passed as string
            us.authConfig.config = JSON.parse(<string>us.authConfig.config);
        }
        return UserStore.fromJson(us);
    }
}
