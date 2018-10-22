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
        return this.query().then(result => this.userStorefromJson(result.defaultUserStore));
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
