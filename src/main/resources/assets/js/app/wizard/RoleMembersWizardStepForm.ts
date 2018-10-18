import {PrincipalMembersWizardStepForm} from './PrincipalMembersWizardStepForm';
import {Role} from '../principal/Role';
import PrincipalKey = api.security.PrincipalKey;

export class RoleMembersWizardStepForm extends PrincipalMembersWizardStepForm {

    constructor() {
        super();
    }

    getPrincipalMembers(): PrincipalKey[] {
        return (<Role>this.getPrincipal()).getMembers();
    }
}
