import {GraphQlRequest} from '../GraphQlRequest';
import {DeletePrincipalResult} from './DeletePrincipalResult';
import PrincipalKey = api.security.PrincipalKey;

export class DeletePrincipalRequest
    extends GraphQlRequest<any, DeletePrincipalResult[]> {

    private keys: PrincipalKey[];

    setKeys(keys: PrincipalKey[]): DeletePrincipalRequest {
        this.keys = keys.slice(0);
        return this;
    }

    getVariables(): Object {
        return {
            keys: this.keys.map((memberKey) => memberKey.toString())
        };
    }

    getMutation(): string {
        return `mutation ($keys: [String]!) {
            deletePrincipals(keys: $keys) {
                principalKey
                deleted
                reason
            }
        }`;
    }

    sendAndParse(): wemQ.Promise<DeletePrincipalResult[]> {

        return this.mutate().then(json => {
            return json.deletePrincipals.map(resultJson => DeletePrincipalResult.fromJson(resultJson));
        });
    }
}
