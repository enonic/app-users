import {ListGraphQlRequest} from '../ListGraphQlRequest';
import {User} from '../../../app/principal/User';
import {Group} from '../../../app/principal/Group';
import {Role} from '../../../app/principal/Role';
import {UserJson} from '../../../app/principal/UserJson';
import {GroupJson} from '../../../app/principal/GroupJson';
import {RoleJson} from '../../../app/principal/RoleJson';
import Principal = api.security.Principal;
import PrincipalJson = api.security.PrincipalJson;
import PrincipalType = api.security.PrincipalType;
import PrincipalKey = api.security.PrincipalKey;
import UserStoreKey = api.security.UserStoreKey;

export type ListPrincipalsResult = {
    total: number;
    principals: Principal[];
};

export class ListPrincipalsRequest
    extends ListGraphQlRequest<any, any> {

    private types: PrincipalType[];
    private userStoreKey: UserStoreKey;
    private searchQuery: string;

    setTypes(types: PrincipalType[]): ListPrincipalsRequest {
        this.types = types;
        return this;
    }

    setUserStoreKey(key: UserStoreKey): ListPrincipalsRequest {
        this.userStoreKey = key;
        return this;
    }

    setQuery(query: string): ListPrincipalsRequest {
        this.searchQuery = query;
        return this;
    }

    getVariables(): { [key: string]: any } {
        let vars = super.getVariables();
        if (this.types && this.types.length > 0) {
            vars['types'] = this.types.map(type => PrincipalType[type]);
        }
        if (this.userStoreKey) {
            vars['userstore'] = this.userStoreKey.toString();
        }
        if (this.searchQuery) {
            vars['query'] = this.searchQuery;
        }
        return vars;
    }

    getQuery(): string {
        return `query($userstore: String, $types: [PrincipalType], $query: String, $start: Int, $count: Int, $sort: SortMode) {
                    principalsConnection (userstore: $userstore, types: $types, query: $query, start: $start, count: $count, sort: $sort) {
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

    sendAndParse(): wemQ.Promise<ListPrincipalsResult> {
        return this.query().then((response: any) => {
            const data = response.principalsConnection;
            return {
                total: data.totalCount,
                principals: data.edges.map(edge => this.fromJsonToPrincipal(edge.node))
            };
        });
    }

    private fromJsonToPrincipal(json: PrincipalJson): Principal {
        let pKey: PrincipalKey = PrincipalKey.fromString(json.key);
        if (pKey.isRole()) {
            return Role.fromJson(<RoleJson>json);

        } else if (pKey.isGroup()) {
            return Group.fromJson(<GroupJson>json);

        } else if (pKey.isUser()) {
            return User.fromJson(<UserJson>json);
        }
    }
}
