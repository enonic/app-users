import {GraphQlRequest} from '../GraphQlRequest';
import {UserStore} from '../../../app/principal/UserStore';
import {UserStoreJson} from '../../../app/principal/UserStoreJson';

export class GetDefaultUserStoreRequest
    extends GraphQlRequest<any, UserStore> {

    getQuery(): string {
        return `query {
            defaultUserStore {
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

    sendAndParse(): wemQ.Promise<UserStore> {
        return this.query().then(result => this.userStorefromJson(result.defaultUserStore));
    }

    userStorefromJson(us: UserStoreJson): UserStore {
        if (!us || Object.keys(us).length === 0) {
            return null;
        }
        if (us.idProviderConfig && typeof us.idProviderConfig.config === 'string') {
            // config is passed as string
            us.idProviderConfig.config = JSON.parse(<string>us.idProviderConfig.config);
        }
        return UserStore.fromJson(us);
    }
}
