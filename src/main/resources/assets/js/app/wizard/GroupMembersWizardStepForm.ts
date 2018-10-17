import {PrincipalMembersWizardStepForm} from './PrincipalMembersWizardStepForm';
import PrincipalKey = api.security.PrincipalKey;
import Group = api.security.Group;

export class GroupMembersWizardStepForm extends PrincipalMembersWizardStepForm {

    constructor() {
        super();
    }

    getPrincipalMembers(): PrincipalKey[] {
        return (<Group>this.getPrincipal()).getMembers();
    }
}
