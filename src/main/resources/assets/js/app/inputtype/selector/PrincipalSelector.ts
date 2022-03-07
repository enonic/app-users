import {PrincipalSelector as BasePrincipalSelector} from 'lib-admin-ui/form/inputtype/principal/PrincipalSelector';
import {PrincipalLoader as BasePrincipalLoader} from 'lib-admin-ui/security/PrincipalLoader';
import {PrincipalLoader} from '../../principal/PrincipalLoader';
import {InputTypeName} from 'lib-admin-ui/form/InputTypeName';

export class PrincipalSelector
    extends BasePrincipalSelector {

    protected createLoader(): BasePrincipalLoader {
        return new PrincipalLoader();
    }

    static getName(): InputTypeName {
        return new InputTypeName('PrincipalSelector', false);
    }
}
