import '../../api.ts';
import {PrincipalMembersWizardStepForm} from './PrincipalMembersWizardStepForm';

import PrincipalKey = api.security.PrincipalKey;

export class RoleMembersWizardStepForm extends PrincipalMembersWizardStepForm {

    constructor() {
        super();
    }

    getPrincipalMembers(): PrincipalKey[] {
        return this.getPrincipal().asRole().getMembers();
    }
}
