import {GraphQlRequest, GraphQlMutationResponse} from '../../GraphQlRequest';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';

type UpdatePwdMutationResponse = GraphQlMutationResponse & {
    updatePwd: boolean;
};

export class UpdatePasswordRequest
    extends GraphQlRequest<boolean> {

    private key: PrincipalKey;
    private password: string;

    setKey(key: PrincipalKey): UpdatePasswordRequest {
        this.key = key;
        return this;
    }

    setPassword(password: string): UpdatePasswordRequest {
        this.password = password;
        return this;
    }

    getVariables(): object {
        let vars = super.getVariables();
        vars['key'] = this.key.toString();
        vars['password'] = this.password;
        return vars;
    }

    getMutation(): string {
        return `mutation ($key: String!, $password: String) {
            updatePwd(key: $key, password: $password)
        }`;
    }

    sendAndParse(): Q.Promise<boolean> {
        return this.mutate().then((json: UpdatePwdMutationResponse) => json.updatePwd);
    }

}
