import {PrincipalMembersWizardStepForm} from './PrincipalMembersWizardStepForm';
import PrincipalKey = api.security.PrincipalKey;
import Role = api.security.Role;

export class RoleMembersWizardStepForm extends PrincipalMembersWizardStepForm {

    constructor() {
        super();
    }

    getPrincipalMembers(): PrincipalKey[] {
        return (<Role>this.getPrincipal()).getMembers();
    }
}
