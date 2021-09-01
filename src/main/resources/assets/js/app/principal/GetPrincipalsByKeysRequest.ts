import {GetPrincipalsByKeysRequest as BaseGetPrincipalsByKeysRequest} from 'lib-admin-ui/security/GetPrincipalsByKeysRequest';
import {UrlHelper} from '../../util/UrlHelper';

export class GetPrincipalsByKeysRequest
    extends BaseGetPrincipalsByKeysRequest {

    protected getPostfixUri() {
        return UrlHelper.getRestUri('');
    }
}
