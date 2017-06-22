import {GraphQlRequest} from '../../GraphQlRequest';
import PrincipalKey = api.security.PrincipalKey;
import User = api.security.User;

export class UpdatePasswordRequest
    extends GraphQlRequest<any, Boolean> {

    private key: PrincipalKey;
    private password: string;

    private static readonly mutation = `mutation ($key: String!, $password: String!) {
            updatePwd(key: $key, password: $password)
        }`;

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

    sendAndParse(): wemQ.Promise<Boolean> {
        return this.mutate(UpdatePasswordRequest.mutation).then(json => json.updatePwd);
    }

}
