import PrincipalKey = api.security.PrincipalKey;
import SecurityResourceRequest = api.security.SecurityResourceRequest;
import {UserJson} from '../principal/UserJson';
import {User} from '../principal/User';

export class SetUserPasswordRequest
    extends SecurityResourceRequest<UserJson, User> {

    private key: PrincipalKey;
    private password: string;

    constructor() {
        super();
        super.setMethod('POST');
    }

    setKey(key: PrincipalKey): SetUserPasswordRequest {
        this.key = key;
        return this;
    }

    setPassword(password: string): SetUserPasswordRequest {
        this.password = password;
        return this;
    }

    getParams(): Object {
        return {
            key: this.key.toString(),
            password: this.password
        };
    }

    getRequestPath(): api.rest.Path {
        return api.rest.Path.fromParent(super.getResourcePath(), 'principals', 'setPassword');
    }

    sendAndParse(): wemQ.Promise<User> {

        return this.send().then((response: api.rest.JsonResponse<UserJson>) => {
            return User.fromJson(response.getResult());
        });
    }

}
