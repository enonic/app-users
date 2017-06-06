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
                authConfig,
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
            return response.userStores.map(UserStore.fromJson);
        });
    }
}