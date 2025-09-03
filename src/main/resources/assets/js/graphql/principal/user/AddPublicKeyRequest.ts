import Q from 'q';
import {GraphQlMutationResponse, GraphQlRequest} from '../../GraphQlRequest';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {PublicKey} from '../../../app/browse/serviceaccount/PublicKey';
import {PublicKeyJson} from '../../../app/principal/PublicKeyJson';

type AddPublicKeyMutationResponse = GraphQlMutationResponse & {
    addPublicKey: PublicKeyJson;
};

export class AddPublicKeyRequest
    extends GraphQlRequest<PublicKey> {

    private key: PrincipalKey;

    private publicKey: string;

    private label: string;

    setKey(key: PrincipalKey): AddPublicKeyRequest {
        this.key = key;
        return this;
    }

    setPublicKey(publicKey: string): AddPublicKeyRequest {
        this.publicKey = publicKey;
        return this;
    }

    setLabel(label: string): AddPublicKeyRequest {
        this.label = label;
        return this;
    }

    getVariables(): object {
        let vars = super.getVariables();
        vars['userKey'] = this.key.toString();
        vars['publicKey'] = this.publicKey;
        vars['label'] = this.label;
        return vars;
    }

    /* eslint-disable max-len */
    getMutation(): string {
        return `mutation ($userKey: String!, $publicKey: String!, $label: String!) {
            addPublicKey(userKey: $userKey, publicKey: $publicKey, label: $label) {
                kid
                publicKey
                creationTime
                label
            }
        }`;
    }

    /* eslint-enable max-len */

    sendAndParse(): Q.Promise<PublicKey> {
        return this.mutate().then((json: AddPublicKeyMutationResponse) => this.fromJson(json.addPublicKey, json.error));
    }

    fromJson(user: PublicKeyJson, error: string): PublicKey {
        if (!user || error) {
            throw Error(error);
        }
        return PublicKey.fromJson(user);
    }

}
