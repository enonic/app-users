import {ListGraphQlRequest} from '../ListGraphQlRequest';
import {PrincipalType} from 'lib-admin-ui/security/PrincipalType';
import {IdProviderKey} from 'lib-admin-ui/security/IdProviderKey';

export type ListPrincipalsKeysResult = {
    displayNames: string[];
};

export class ListPrincipalsNamesRequest
    extends ListGraphQlRequest<any> {

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

    getVariables(): { [key: string]: any } {
        let vars = super.getVariables();
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

    sendAndParse(): Q.Promise<ListPrincipalsKeysResult> {
        return this.query().then((response: any) => {
            const data = response.principalsConnection;
            return {
                displayNames: data.edges.map(edge => edge.node.displayName)
            };
        });
    }
}
