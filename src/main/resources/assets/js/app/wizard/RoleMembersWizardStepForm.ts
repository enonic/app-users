import {PrincipalMembersWizardStepForm} from './PrincipalMembersWizardStepForm';
import {Role} from '../principal/Role';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';

export class RoleMembersWizardStepForm extends PrincipalMembersWizardStepForm {

    constructor() {
        super();
    }

    getPrincipalMembers(): PrincipalKey[] {
        return (<Role>this.getPrincipal()).getMembers();
    }
}
