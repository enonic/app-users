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

    sendAndParse(): wemQ.Promise<UserStore[]> {
        return this.query().then((response: UserStoreListResult) => {
            return response.userStores.map(this.userStorefromJson);
        });
    }

    userStorefromJson(userstore: UserStoreJson) {
        if (userstore.idProviderConfig && typeof userstore.idProviderConfig.config === 'string') {
            // config is passed as string
            userstore.idProviderConfig.config = JSON.parse(<string>userstore.idProviderConfig.config);
        }
        return UserStore.fromJson(userstore);
    }
}
