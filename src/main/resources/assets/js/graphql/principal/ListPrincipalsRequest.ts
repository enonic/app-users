import {ListGraphQlRequest} from '../ListGraphQlRequest';
import {User} from '../../app/principal/User';
import {Group} from '../../app/principal/Group';
import {Role} from '../../app/principal/Role';
import {UserJson} from '../../app/principal/UserJson';
import {GroupJson} from '../../app/principal/GroupJson';
import {RoleJson} from '../../app/principal/RoleJson';
import {Principal} from 'lib-admin-ui/security/Principal';
import {PrincipalJson} from 'lib-admin-ui/security/PrincipalJson';
import {PrincipalType} from 'lib-admin-ui/security/PrincipalType';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {IdProviderKey} from 'lib-admin-ui/security/IdProviderKey';

export type ListPrincipalsResult = {
    total: number;
    principals: Principal[];
};

export class ListPrincipalsRequest
    extends ListGraphQlRequest<any, any> {

    private types: PrincipalType[];
    private idProviderKey: IdProviderKey;
    private searchQuery: string;
    private forbidden: string[] = [];

    private static defaultForbiddenPrincipalPattern: string = 'com.enonic.cms.*';

    constructor() {
        super();

        this.forbidden.push(ListPrincipalsRequest.defaultForbiddenPrincipalPattern);
    }

    setTypes(types: PrincipalType[]): ListPrincipalsRequest {
        this.types = types;
        return this;
    }

    setIdProviderKey(key: IdProviderKey): ListPrincipalsRequest {
        this.idProviderKey = key;
        return this;
    }

    setQuery(query: string): ListPrincipalsRequest {
        this.searchQuery = query;
        return this;
    }

    addForbiddenKeyPattern(value: string): ListPrincipalsRequest {
        this.forbidden.push(value);
        return this;
    }

    getVariables(): { [key: string]: any } {
        let vars = super.getVariables();
        if (this.types && this.types.length > 0) {
            vars['types'] = this.types.map(type => PrincipalType[type]);
        }
        if (this.idProviderKey) {
            vars['idprovider'] = this.idProviderKey.toString();
        }
        if (this.searchQuery) {
            vars['query'] = this.searchQuery;
        }
        if (this.forbidden && this.forbidden.length > 0) {
            vars['forbidden'] = this.forbidden;
        }
        return vars;
    }

    getQuery(): string {
        return `query($idprovider: String, $types: [PrincipalType], $query: String, $forbidden: [String], $start: Int, $count: Int, $sort: String) {
                  principalsConnection (idprovider: $idprovider, types: $types, query: $query, forbidden: $forbidden, start: $start, count: $count, sort: $sort) {
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

    sendAndParse(): Q.Promise<ListPrincipalsResult> {
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
