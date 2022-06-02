import {ListGraphQlRequest} from '../ListGraphQlRequest';
import {User} from '../../app/principal/User';
import {Group} from '../../app/principal/Group';
import {Role} from '../../app/principal/Role';
import {UserJson} from '../../app/principal/UserJson';
import {GroupJson} from '../../app/principal/GroupJson';
import {RoleJson} from '../../app/principal/RoleJson';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {PrincipalJson} from '@enonic/lib-admin-ui/security/PrincipalJson';
import {PrincipalType} from '@enonic/lib-admin-ui/security/PrincipalType';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {IdProviderKey} from '@enonic/lib-admin-ui/security/IdProviderKey';
import {ListPrincipalsProperties} from './ListPrincipalsNamesRequest';

export type ListPrincipalsData = {
    total: number;
    principals: Principal[];
};

type ListPrincipalsResult = {
    principalsConnection: {
        totalCount: number,
        edges: [{ node: PrincipalJson }],
    };
};

export class ListPrincipalsRequest
    extends ListGraphQlRequest<ListPrincipalsData> {

    private types: PrincipalType[];
    private idProviderKey: IdProviderKey;

    setTypes(types: PrincipalType[]): ListPrincipalsRequest {
        this.types = types;
        return this;
    }

    setIdProviderKey(key: IdProviderKey): ListPrincipalsRequest {
        this.idProviderKey = key;
        return this;
    }

    getVariables(): ListPrincipalsProperties {
        const vars = <ListPrincipalsProperties>super.getVariables();

        if (this.types && this.types.length > 0) {
            vars['types'] = this.types.map(type => PrincipalType[type]);
        }

        if (this.idProviderKey) {
            vars['idprovider'] = this.idProviderKey.toString();
        }

        return vars;
    }

    getQuery(): string {
        return `query($idprovider: String, $types: [PrincipalType], $query: String, $start: Int, $count: Int, $sort: String) {
                  principalsConnection (idprovider: $idprovider, types: $types, query: $query, start: $start, count: $count, sort: $sort) {
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

    override sendAndParse(): Q.Promise<ListPrincipalsData> {
        return this.query().then((response: ListPrincipalsResult) => {
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
