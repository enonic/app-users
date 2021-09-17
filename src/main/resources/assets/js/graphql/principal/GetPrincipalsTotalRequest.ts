import {ListGraphQlRequest} from '../ListGraphQlRequest';
import {PrincipalType} from 'lib-admin-ui/security/PrincipalType';
import {IdProviderKey} from 'lib-admin-ui/security/IdProviderKey';
import {ListPrincipalsProperties} from './ListPrincipalsNamesRequest';

type GetPrincipalsTotalResult = {
    principalsConnection: {
        totalCount: number
    }
};

type GetPrincipalsTotalResult = {
    principalsConnection: {
        totalCount: number
    }
};

export class GetPrincipalsTotalRequest
    extends ListGraphQlRequest<number> {

    private types: PrincipalType[];
    private idProviderKey: IdProviderKey;

    setTypes(types: PrincipalType[]): GetPrincipalsTotalRequest {
        this.types = types;
        return this;
    }

    setIdProviderKey(key: IdProviderKey): GetPrincipalsTotalRequest {
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
                        totalCount
                    }
                }`;
    }

    sendAndParse(): Q.Promise<number> {
        return this.query().then((response: GetPrincipalsTotalResult) => {
            const data = response.principalsConnection;
            return data.totalCount;
        });
    }
}
