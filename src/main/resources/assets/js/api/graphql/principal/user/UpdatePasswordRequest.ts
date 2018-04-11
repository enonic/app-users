import {GraphQlRequest} from '../../GraphQlRequest';
import PrincipalKey = api.security.PrincipalKey;

export class UpdatePasswordRequest
    extends GraphQlRequest<any, Boolean> {

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

    getVariables(): Object {
        let vars = super.getVariables();
        vars['key'] = this.key.toString();
        vars['password'] = this.password;
        return vars;
    }

    getMutation(): string {
        return `mutation ($key: String!, $password: String!) {
            updatePwd(key: $key, password: $password)
        }`;
    }

    sendAndParse(): wemQ.Promise<Boolean> {
        return this.mutate().then(json => json.updatePwd);
    }

}
