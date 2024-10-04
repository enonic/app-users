import {PrincipalSelector as BasePrincipalSelector} from '@enonic/lib-admin-ui/form/inputtype/principal/PrincipalSelector';
import {InputTypeName} from '@enonic/lib-admin-ui/form/InputTypeName';
import {UrlHelper} from '../../../util/UrlHelper';

export class PrincipalSelector
    extends BasePrincipalSelector {

    protected getPostfixUri(): string {
        return UrlHelper.getRestUri('');
    }

    static getName(): InputTypeName {
        return new InputTypeName('PrincipalSelector', false);
    }
}
