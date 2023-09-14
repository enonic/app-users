import {GetPrincipalsByKeysRequest as BaseGetPrincipalsByKeysRequest} from '@enonic/lib-admin-ui/security/GetPrincipalsByKeysRequest';
import {UrlHelper} from '../../util/UrlHelper';

export class GetPrincipalsByKeysRequest
    extends BaseGetPrincipalsByKeysRequest {

    protected getPostfixUri(): string {
        return UrlHelper.getRestUri('');
    }
}
