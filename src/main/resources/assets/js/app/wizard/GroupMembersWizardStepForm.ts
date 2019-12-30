import {PrincipalMembersWizardStepForm} from './PrincipalMembersWizardStepForm';
import {Group} from '../principal/Group';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';

export class GroupMembersWizardStepForm extends PrincipalMembersWizardStepForm {

    constructor() {
        super();
    }

    getPrincipalMembers(): PrincipalKey[] {
        return (<Group>this.getPrincipal()).getMembers();
    }
}
