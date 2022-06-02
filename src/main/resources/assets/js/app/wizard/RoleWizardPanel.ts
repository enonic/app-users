import {MembersWizardPanel} from './MembersWizardPanel';
import {PrincipalWizardPanelParams} from './PrincipalWizardPanelParams';
import {CreateRoleRequest} from '../../graphql/principal/role/CreateRoleRequest';
import {UpdateRoleRequest} from '../../graphql/principal/role/UpdateRoleRequest';
import {UserItemCreatedEvent} from '../event/UserItemCreatedEvent';
import {Role, RoleBuilder} from '../principal/Role';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {RoleKeys} from '@enonic/lib-admin-ui/security/RoleKeys';
import {WizardStep} from '@enonic/lib-admin-ui/app/wizard/WizardStep';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {showFeedback} from '@enonic/lib-admin-ui/notify/MessageBus';
import {WizardHeaderWithDisplayNameAndName} from '@enonic/lib-admin-ui/app/wizard/WizardHeaderWithDisplayNameAndName';
import {ArrayHelper} from '@enonic/lib-admin-ui/util/ArrayHelper';

export class RoleWizardPanel
    extends MembersWizardPanel {

    constructor(params: PrincipalWizardPanelParams) {
        super(params);

        this.addClass('role-wizard-panel');
    }

    createSteps(principal?: Principal): WizardStep[] {
        const steps: WizardStep[] = [];

        steps.push(new WizardStep(i18n('field.role'), this.getDescriptionWizardStepForm()));

        if (!RoleKeys.isEveryone(principal?.getKey())) {
            steps.push(new WizardStep(i18n('field.grants'), this.getMembersWizardStepForm()));
        }

        return steps;
    }

    persistNewItem(): Q.Promise<Principal> {
        return this.produceCreateRoleRequest().sendAndParse().then((principal: Principal) => {

            showFeedback(i18n('notify.create.role'));
            new UserItemCreatedEvent(principal, this.getIdProvider(), this.isParentOfSameType()).fire();
            this.notifyUserItemNamed(principal);

            return principal;
        });
    }

    produceCreateRoleRequest(): CreateRoleRequest {
        const wizardHeader: WizardHeaderWithDisplayNameAndName = this.getWizardHeader();
        wizardHeader.normalizeNames();

        const key: PrincipalKey = PrincipalKey.ofRole(wizardHeader.getName());
        const name: string = wizardHeader.getDisplayName();
        const members: PrincipalKey[] = this.getMembersWizardStepForm().getMembersKeys();
        const description: string = this.getDescriptionWizardStepForm().getDescription();

        return new CreateRoleRequest().setKey(key).setDisplayName(name).setMembers(members).setDescription(description);
    }

    produceUpdateRequest(viewedPrincipal: Principal): UpdateRoleRequest {
        const role: Role = (<Role>viewedPrincipal);
        const key: PrincipalKey = role.getKey();
        const displayName: string = role.getDisplayName();
        const description: string = role.getDescription();
        const oldMembers: PrincipalKey[] = (<Role>this.getPersistedItem()).getMembers();
        const newMembers: PrincipalKey[] = role.getMembers();
        const addMembers: PrincipalKey[] = ArrayHelper.difference(newMembers, oldMembers, (a, b) => a.equals(b));
        const removeMembers: PrincipalKey[] = ArrayHelper.difference(oldMembers, newMembers, (a, b) => a.equals(b));

        return new UpdateRoleRequest()
            .setKey(key)
            .setDisplayName(displayName)
            .addMembers(addMembers)
            .removeMembers(removeMembers)
            .setDescription(description);
    }

    assembleViewedItem(): Principal {
        return new RoleBuilder(<Role>this.getPersistedItem())
            .setMembers(this.getMembersWizardStepForm().getMembersKeys().sort(this.sortMembers))
            .setDisplayName(this.getWizardHeader().getDisplayName())
            .setDescription(this.getDescriptionWizardStepForm().getDescription()).build();
    }

    protected assemblePersistedItem(): Principal {
        const persistedRole: Role = (<Role>this.getPersistedItem());

        return persistedRole
            .newBuilder()
            .setMembers(persistedRole.getMembers().sort(this.sortMembers))
            .build();
    }
}
