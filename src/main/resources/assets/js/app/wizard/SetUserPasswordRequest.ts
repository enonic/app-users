import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {SecurityResourceRequest} from '@enonic/lib-admin-ui/security/SecurityResourceRequest';
import {UserJson} from '../principal/UserJson';
import {User} from '../principal/User';
import {JsonResponse} from '@enonic/lib-admin-ui/rest/JsonResponse';
import {HttpMethod} from '@enonic/lib-admin-ui/rest/HttpMethod';
import {UrlHelper} from '../../util/UrlHelper';

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

    getParams(): object {
        return {
            key: this.key.toString(),
            password: this.password
        };
    }

    protected getPostfixUri(): string {
        return UrlHelper.getRestUri('');
    }

    protected parseResponse(response: JsonResponse<UserJson>): User {
        return User.fromJson(response.getResult());
    }

}
