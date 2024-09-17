import {GraphQlMutationResponse, GraphQlRequest} from '../../GraphQlRequest';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';

type DeletePublicKeyMutationResponse = GraphQlMutationResponse & {
    removePublicKey: boolean;
};

export class DeletePublicKeyRequest
    extends GraphQlRequest<boolean> {

    private key: PrincipalKey;

    private kid: string;

    setKey(key: PrincipalKey): DeletePublicKeyRequest {
        this.key = key;
        return this;
    }

    setKid(kid: string): DeletePublicKeyRequest {
        this.kid = kid;
        return this;
    }

    getVariables(): object {
        let vars = super.getVariables();
        vars['userKey'] = this.key.toString();
        vars['kid'] = this.kid;
        return vars;
    }

    /* eslint-disable max-len */
    getMutation(): string {
        return `mutation ($userKey: String!, $kid: String!) {
            removePublicKey(userKey: $userKey, kid: $kid)
        }`;
    }

    /* eslint-enable max-len */

    sendAndParse(): Q.Promise<boolean> {
        return this.mutate().then((json: DeletePublicKeyMutationResponse) => this.fromJson(json.removePublicKey, json.error));
    }

    fromJson(removed: boolean, error: string): boolean {
        if (error) {
            throw Error(error);
        }
        return removed;
    }

}
