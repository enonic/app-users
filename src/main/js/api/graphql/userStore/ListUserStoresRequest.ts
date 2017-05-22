import UserStoreListResult = api.security.UserStoreListResult;
import UserStore = api.security.UserStore;
import UserStoreJson = api.security.UserStoreJson;
import {ListGraphQlRequest} from '../ListGraphQlRequest';

export class ListUserStoresRequest
    extends ListGraphQlRequest<UserStoreListResult, UserStore[]> {

    getQuery() {
        return `{
            userStores ${this.getQueryParams().join(',')} {
                key,
                name,
                path,
                description,
                displayName,    
                authConfig,
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
        return this.send().then((response: UserStoreListResult) => {
            return response.userStores.map((userStoreJson: UserStoreJson) => {
                return this.fromJsonToUserStore(userStoreJson);
            });
        });
    }

    fromJsonToUserStore(json: UserStoreJson): UserStore {
        return UserStore.fromJson(json);
    }
}