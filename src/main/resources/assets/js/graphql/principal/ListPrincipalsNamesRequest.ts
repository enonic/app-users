import {ListGraphQlProperties, ListGraphQlRequest} from '../ListGraphQlRequest';
import {PrincipalType} from '@enonic/lib-admin-ui/security/PrincipalType';
import {IdProviderKey} from '@enonic/lib-admin-ui/security/IdProviderKey';

export type ListPrincipalsKeysResult = {
    displayNames: string[];
};

export interface ListPrincipalsProperties extends ListGraphQlProperties {
    types: string[];
    idProviderKey: IdProviderKey;
} 

export class ListPrincipalsNamesRequest
    extends ListGraphQlRequest<ListPrincipalsKeysResult> {

    private types: PrincipalType[];
    private idProviderKey: IdProviderKey;

    setTypes(types: PrincipalType[]): ListPrincipalsNamesRequest {
        this.types = types;
        return this;
    }

    setIdProviderKey(key: IdProviderKey): ListPrincipalsNamesRequest {
        this.idProviderKey = key;
        return this;
    }

    getVariables(): ListPrincipalsProperties {
        let vars = <ListPrincipalsProperties>super.getVariables();
        if (this.types && this.types.length > 0) {
            vars['types'] = this.types.map(type => PrincipalType[type]);
        }
        if (this.idProviderKey) {
            vars['idprovider'] = this.idProviderKey.toString();
        }

        return vars;
    }

    getQuery(): string {
        return `query($idprovider: String, $types: [PrincipalType], $start: Int, $count: Int, $sort: String) {
                  principalsConnection (idprovider: $idprovider, types: $types, start: $start, count: $count, sort: $sort) {
                        edges {
                            node {
                                displayName
                            }
                        }
                    }
                }`;
    }

    override sendAndParse(): Q.Promise<ListPrincipalsKeysResult> {
        return this.query().then((response: any) => {
            const data = response.principalsConnection;
            return {
                displayNames: data.edges.map(edge => edge.node.displayName)
            };
        });
    }
}
