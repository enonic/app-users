import UserStore = api.security.UserStore;
import UserStoreJson = api.security.UserStoreJson;
import {GraphQlRequest} from '../GraphQlRequest';
import UserStoreKey = api.security.UserStoreKey;

export class GetUserStoreByKeyRequest
    extends GraphQlRequest<any, UserStore> {

    private key: UserStoreKey;

    constructor(key: api.security.UserStoreKey) {
        super();
        this.key = key;
    }

    getQuery() {
        return `{
            userStore ${this.formatQueryParams()} {
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
    }

    getQueryParams(): string[] {
        let params = super.getQueryParams();
        if (this.key) {
            params.push(`key: "${this.key.toString()}"`);
        }
        return params;
    }

    sendAndParse(): wemQ.Promise<UserStore> {
        return this.send().then((result: any) => {
            return this.fromJsonToUserStore(result.userStore);
        });
    }

    fromJsonToUserStore(json: UserStoreJson): UserStore {
        return UserStore.fromJson(json);
    }
}