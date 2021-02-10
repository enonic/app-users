import {MembershipWizardPanel} from './MembershipWizardPanel';
import {PrincipalWizardPanelParams} from './PrincipalWizardPanelParams';
import {CreateRoleRequest} from '../../graphql/principal/role/CreateRoleRequest';
import {UpdateRoleRequest} from '../../graphql/principal/role/UpdateRoleRequest';
import {UserItemCreatedEvent} from '../event/UserItemCreatedEvent';
import {Role, RoleBuilder} from '../principal/Role';
import {Principal} from 'lib-admin-ui/security/Principal';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {RoleKeys} from 'lib-admin-ui/security/RoleKeys';
import {WizardStep} from 'lib-admin-ui/app/wizard/WizardStep';
import {i18n} from 'lib-admin-ui/util/Messages';
import {showFeedback} from 'lib-admin-ui/notify/MessageBus';
import {MembershipWizardStepForm} from './MembershipWizardStepForm';

export class RoleWizardPanel
    extends MembershipWizardPanel {

    constructor(params: PrincipalWizardPanelParams) {

        super(new MembershipWizardStepForm(), params);

        this.addClass('role-wizard-panel');
    }

    createSteps(principal?: Principal): WizardStep[] {
        let steps: WizardStep[] = [];

        let descriptionStep = this.getDescriptionWizardStepForm();

        steps.push(new WizardStep(i18n('field.role'), descriptionStep));

        let principalKey: PrincipalKey = principal ? principal.getKey() : undefined;
        if (!RoleKeys.isEveryone(principalKey)) {
            let membersStep = this.getMembersWizardStepForm();
            steps.push(new WizardStep(i18n('field.grants'), membersStep));
        }

        return steps;
    }

    persistNewItem(): Q.Promise<Principal> {
        return this.produceCreateRoleRequest().sendAndParse().then((principal: Principal) => {

            showFeedback(i18n('notify.create.role'));
            new UserItemCreatedEvent(principal, this.getIdProvider(), this.isParentOfSameType()).fire();
            this.notifyPrincipalNamed(principal);

            return principal;
        });
    }

    produceCreateRoleRequest(): CreateRoleRequest {
        let wizardHeader = this.getWizardHeader();
        wizardHeader.normalizeNames();
        let key = PrincipalKey.ofRole(wizardHeader.getName());
        let name = wizardHeader.getDisplayName();
        let members = this.getMembersWizardStepForm().getMembersKeys();
        let description = this.getDescriptionWizardStepForm().getDescription();
        return new CreateRoleRequest().setKey(key).setDisplayName(name).setMembers(members).setDescription(description);
    }

    produceUpdateRequest(viewedPrincipal: Principal): UpdateRoleRequest {
        let role = (<Role>viewedPrincipal);
        let key = role.getKey();
        let displayName = role.getDisplayName();
        let description = role.getDescription();
        let oldMembers = (<Role>this.getPersistedItem()).getMembers();
        let oldMembersIds = oldMembers.map(el => el.getId());
        let newMembers = role.getMembers();
        let newMembersIds = newMembers.map(el => el.getId());
        let addMembers = newMembers.filter(el => oldMembersIds.indexOf(el.getId()) < 0);
        let removeMembers = oldMembers.filter(el => newMembersIds.indexOf(el.getId()) < 0);

        return new UpdateRoleRequest().setKey(key).setDisplayName(displayName).addMembers(addMembers).removeMembers(
            removeMembers).setDescription(description);
    }

    assembleViewedItem(): Principal {
        return new RoleBuilder(<Role>this.getPersistedItem())
            .setMembers(this.getMembersWizardStepForm().getMembersKeys())
            .setDisplayName(this.getWizardHeader().getDisplayName())
            .setDescription(this.getDescriptionWizardStepForm().getDescription()).build();
    }

    isPersistedEqualsViewed(): boolean {
        let persistedPrincipal = (<Role>this.getPersistedItem());
        let viewedPrincipal = (<Role>this.assembleViewedItem());
        // Group/User order can be different for viewed and persisted principal
        viewedPrincipal.getMembers().sort((a, b) => {
            return a.getId().localeCompare(b.getId());
        });
        persistedPrincipal.getMembers().sort((a, b) => {
            return a.getId().localeCompare(b.getId());
        });

        return viewedPrincipal.equals(persistedPrincipal);
    }
}
