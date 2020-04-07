import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {SecurityResourceRequest} from 'lib-admin-ui/security/SecurityResourceRequest';
import {UserJson} from '../principal/UserJson';
import {User} from '../principal/User';
import {JsonResponse} from 'lib-admin-ui/rest/JsonResponse';
import {HttpMethod} from 'lib-admin-ui/rest/HttpMethod';

export class SetUserPasswordRequest
    extends SecurityResourceRequest<User> {

    private key: PrincipalKey;
    private password: string;

    constructor() {
        super();
        super.setMethod(HttpMethod.POST);
        this.addRequestPathElements('principals', 'setPassword');
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

    protected parseResponse(response: JsonResponse<UserJson>): User {
        return User.fromJson(response.getResult());
    }

}
