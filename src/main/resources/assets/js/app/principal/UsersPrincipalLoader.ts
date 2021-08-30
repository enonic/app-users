import {PrincipalLoader} from 'lib-admin-ui/security/PrincipalLoader';
import {UrlHelper} from '../../util/UrlHelper';

export class UsersPrincipalLoader
    extends PrincipalLoader {

    constructor() {
        super();
        this.setListUri(UrlHelper.getRestUri('security/principals'));
        this.setGetUri(UrlHelper.getRestUri('security/principals/resolveByKeys'));
    }
}
