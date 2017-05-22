import UserStoreListResult = api.security.UserStoreListResult;
import UserStore = api.security.UserStore;
import UserStoreJson = api.security.UserStoreJson;
import {ListGraphQlRequest} from '../ListGraphQlRequest';
import Principal = api.security.Principal;
import PrincipalJson = api.security.PrincipalJson;
import PrincipalListJson = api.security.PrincipalListJson;
import PrincipalType = api.security.PrincipalType;
import UserStoreKey = api.security.UserStoreKey;

export class ListPrincipalsRequest
    extends ListGraphQlRequest<PrincipalListJson, Principal[]> {

    private types: PrincipalType[];
    private userStoreKey: UserStoreKey;

    getQuery() {
        return `{
            principals ${this.getQueryParams().join(',')} {
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
                    allow,
                    deny
                }
            }
        }`;
    }

    setTypes(types: PrincipalType[]): ListPrincipalsRequest {
        this.types = types;
        return this;
    }

    setUserStoreKey(key: UserStoreKey): ListPrincipalsRequest {
        this.userStoreKey = key;
        return this;
    }

    getQueryParams(): string[] {
        let params = super.getQueryParams();
        if (this.types && this.types.length > 0) {
            params.push('types: ' + JSON.stringify(this.types))
        }
        if (this.userStoreKey) {
            params.push('userStoreKey: ' + this.userStoreKey.toString());
        }
        return params;
    }

    sendAndParse(): wemQ.Promise<Principal[]> {
        return this.send().then((response: PrincipalListJson) => {
            return response.principals.map((userStoreJson: UserStoreJson) => {
                return this.fromJsonToPrincipal(userStoreJson);
            });
        });
    }

    fromJsonToPrincipal(json: PrincipalJson): Principal {
        return Principal.fromJson(json);
    }
}