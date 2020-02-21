import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {SecurityResourceRequest} from 'lib-admin-ui/security/SecurityResourceRequest';
import {UserJson} from '../principal/UserJson';
import {User} from '../principal/User';
import {Path} from 'lib-admin-ui/rest/Path';
import {JsonResponse} from 'lib-admin-ui/rest/JsonResponse';
import {HttpMethod} from 'lib-admin-ui/rest/HttpMethod';

export class SetUserPasswordRequest
    extends SecurityResourceRequest<UserJson, User> {

    private key: PrincipalKey;
    private password: string;

    constructor() {
        super();
        super.setMethod(HttpMethod.POST);
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

    getRequestPath(): Path {
        return Path.fromParent(super.getResourcePath(), 'principals', 'setPassword');
    }

    sendAndParse(): Q.Promise<User> {

        return this.send().then((response: JsonResponse<UserJson>) => {
            return User.fromJson(response.getResult());
        });
    }

}
