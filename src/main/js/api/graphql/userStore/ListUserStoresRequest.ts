import UserStoreListResult = api.security.UserStoreListResult;
import UserStore = api.security.UserStore;
import UserStoreJson = api.security.UserStoreJson;
import {ListGraphQlRequest} from '../ListGraphQlRequest';

export class ListUserStoresRequest
    extends ListGraphQlRequest<UserStoreListResult, UserStore[]> {

    private static listQuery = `query($start: Int, $count: Int, $sort: SortMode) {
            userStores(start: $start, count: $count, sort: $sort) {
                id,
                key,
                name,
                path,
                displayName,    
                description,
                authConfig {
                    applicationKey
                    config
                }
                idProviderMode,
                modifiedTime,
                permissions {
                    principal {
                        displayName
                        key
                    }
                    access
                }
            }
        }`;

    sendAndParse(): wemQ.Promise<UserStore[]> {
        return this.query(ListUserStoresRequest.listQuery).then((response: UserStoreListResult) => {
            return response.userStores.map(this.userStorefromJson);
        });
    }

    userStorefromJson(us) {
        if (us.authConfig && typeof us.authConfig.config === 'string') {
            // config is passed as string
            us.authConfig.config = JSON.parse(us.authConfig.config);
        }
        return UserStore.fromJson(us);
    }
}