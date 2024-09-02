import {PrincipalComboBox, PrincipalComboBoxParams} from '@enonic/lib-admin-ui/ui/security/PrincipalComboBox';
import {UrlHelper} from '../../util/UrlHelper';

export class UsersPrincipalCombobox extends PrincipalComboBox {

    constructor(options?: PrincipalComboBoxParams) {
        options.postfixUri = options.postfixUri ?? UrlHelper.getRestUri(''); // override the default postfixUri
        super(options);
    }
}
