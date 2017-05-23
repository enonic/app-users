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
    extends ListGraphQlRequest<any, any> {

    private types: PrincipalType[];
    private userStoreKey: UserStoreKey;
    private query: string;

    getQuery() {
        return `query {
                    principalsConnection ${this.formatQueryParams()} {
                        totalCount
                        edges {
                            node {
                                key,
                                name,
                                path,
                                description,
                                displayName,
                                permissions {
                                    principal {
                                        displayName
                                        key
                                    }
                                    allow,
                                    deny
                                }
                            }
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

    setQuery(query: string): ListPrincipalsRequest {
        this.query = query;
        return this;
    }

    getQueryParams(): string[] {
        let params = super.getQueryParams();
        if (this.types && this.types.length > 0) {
            params.push(`types: [${this.types.map(type => PrincipalType[type]).join(',')}]`);
        }
        if (!!this.userStoreKey) {
            params.push(`userstore: "${this.userStoreKey.toString()}"`);
        }
        if (!!this.query) {
            params.push(`query: "${this.query}"`);
        }
        return params;
    }

    sendAndParse(): wemQ.Promise<any> {
        return this.send().then((response: any) => {
            let data = response.principalsConnection;
            return {
                principals: data.edges.map((edge: any) => {
                    return this.fromJsonToPrincipal(edge.node);
                }),
                total: data.totalCount
            }
        });
    }

    fromJsonToPrincipal(json: PrincipalJson): Principal {
        return Principal.fromJson(json);
    }
}