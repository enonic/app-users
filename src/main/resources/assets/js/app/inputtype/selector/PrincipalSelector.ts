import {PrincipalSelector as BasePrincipalSelector} from '@enonic/lib-admin-ui/form/inputtype/principal/PrincipalSelector';
import {PrincipalLoader as BasePrincipalLoader} from '@enonic/lib-admin-ui/security/PrincipalLoader';
import {PrincipalLoader} from '../../principal/PrincipalLoader';
import {InputTypeName} from '@enonic/lib-admin-ui/form/InputTypeName';
import {UrlHelper} from '../../../util/UrlHelper';

export class PrincipalSelector
    extends BasePrincipalSelector {

    protected createLoader(): BasePrincipalLoader {
        return new PrincipalLoader(UrlHelper.getRestUri(''));
    }

    static getName(): InputTypeName {
        return new InputTypeName('PrincipalSelector', false);
    }
}
