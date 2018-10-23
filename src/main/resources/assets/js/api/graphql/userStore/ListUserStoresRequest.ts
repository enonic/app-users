import {ListGraphQlRequest} from '../ListGraphQlRequest';
import {UserStoreListResult} from './UserStoreListResult';
import {UserStore} from '../../../app/principal/UserStore';
import {UserStoreJson} from '../../../app/principal/UserStoreJson';

export class ListUserStoresRequest
    extends ListGraphQlRequest<UserStoreListResult, UserStore[]> {

    getQuery(): string {
        return `query {
            userStores {
                key,
                displayName,
                description,
                authConfig {
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

    sendAndParse(): wemQ.Promise<UserStore[]> {
        return this.query().then((response: UserStoreListResult) => {
            return response.userStores.map(this.userStorefromJson);
        });
    }

    userStorefromJson(userstore: UserStoreJson) {
        if (userstore.authConfig && typeof userstore.authConfig.config === 'string') {
            // config is passed as string
            userstore.authConfig.config = JSON.parse(<string>userstore.authConfig.config);
        }
        return UserStore.fromJson(userstore);
    }
}
