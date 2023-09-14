import {ListGraphQlRequest} from '../ListGraphQlRequest';
import {PrincipalType} from '@enonic/lib-admin-ui/security/PrincipalType';
import {IdProviderKey} from '@enonic/lib-admin-ui/security/IdProviderKey';
import {ListPrincipalsProperties} from './ListPrincipalsNamesRequest';

interface GetPrincipalsExistenceRequestResult {
    principalsConnection: {
        totalCount: number
    }
}

export class GetPrincipalsExistenceRequest
    extends ListGraphQlRequest<boolean> {

    private types: PrincipalType[];
    private idProviderKey: IdProviderKey;

    constructor() {
        super();
        this.setCount(0);
    }

    setTypes(types: PrincipalType[]): GetPrincipalsExistenceRequest {
        this.types = types;
        return this;
    }

    setIdProviderKey(key: IdProviderKey): GetPrincipalsExistenceRequest {
        this.idProviderKey = key;
        return this;
    }

    getVariables(): ListPrincipalsProperties {
        let vars = super.getVariables() as ListPrincipalsProperties;
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

    sendAndParse(): Q.Promise<boolean> {
        return this.query().then((response: GetPrincipalsExistenceRequestResult) => {
            return response.principalsConnection.totalCount > 0;
        });
    }
}
