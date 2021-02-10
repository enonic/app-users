import {MembershipWizardPanel} from './MembershipWizardPanel';
import {PrincipalWizardPanelParams} from './PrincipalWizardPanelParams';
import {CreateGroupRequest} from '../../graphql/principal/group/CreateGroupRequest';
import {UpdateGroupRequest} from '../../graphql/principal/group/UpdateGroupRequest';
import {UserItemCreatedEvent} from '../event/UserItemCreatedEvent';
import {Group, GroupBuilder} from '../principal/Group';
import {Principal} from 'lib-admin-ui/security/Principal';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {PrincipalLoader} from 'lib-admin-ui/security/PrincipalLoader';
import {WizardStep} from 'lib-admin-ui/app/wizard/WizardStep';
import {ArrayHelper} from 'lib-admin-ui/util/ArrayHelper';
import {i18n} from 'lib-admin-ui/util/Messages';
import {showFeedback} from 'lib-admin-ui/notify/MessageBus';
import {MembershipWizardStepForm} from './MembershipWizardStepForm';
import {Membership} from '../principal/Membership';
import {RolesWizardStepForm} from './RolesWizardStepForm';

export class GroupWizardPanel extends MembershipWizardPanel {

    private rolesWizardStepForm: RolesWizardStepForm;

    constructor(params: PrincipalWizardPanelParams) {

        super(new MembershipWizardStepForm(), params);

        this.addClass('group-wizard-panel');
    }

    createSteps(principal?: Principal): WizardStep[] {
        const steps: WizardStep[] = [];

        const descriptionStep = this.getDescriptionWizardStepForm();
        const membersStep = this.getMembersWizardStepForm();
        this.rolesWizardStepForm = new RolesWizardStepForm();

        steps.push(new WizardStep(i18n('field.groups'), descriptionStep));
        steps.push(new WizardStep(i18n('field.members'), membersStep));
        steps.push(new WizardStep(i18n('field.roles'), this.rolesWizardStepForm));

        return steps;
    }

    protected doLayoutPersistedItem(principal: Membership): Q.Promise<void> {

        return super.doLayoutPersistedItem(principal).then(() => {
            if (principal) {
                this.rolesWizardStepForm.layout(principal);
            }
        });
    }

    persistNewItem(): Q.Promise<Principal> {

        return this.produceCreateGroupRequest().sendAndParse().then((principal: Principal) => {

            showFeedback(i18n('notify.create.group'));
            new UserItemCreatedEvent(principal, this.getIdProvider(), this.isParentOfSameType()).fire();
            this.notifyPrincipalNamed(principal);

            (<PrincipalLoader>this.getMembersWizardStepForm().getLoader()).skipPrincipal(principal.getKey());

            return principal;
        });
    }

    produceCreateGroupRequest(): CreateGroupRequest {
        const wizardHeader = this.getWizardHeader();
        wizardHeader.normalizeNames();
        const key = PrincipalKey.ofGroup(this.getIdProvider().getKey(), wizardHeader.getName());
        const name = wizardHeader.getDisplayName();
        const members = this.getMembersWizardStepForm().getMembersKeys();
        const description = this.getDescriptionWizardStepForm().getDescription();
        const memberships = this.rolesWizardStepForm.getRolesKeys();
        return new CreateGroupRequest()
            .setKey(key)
            .setDisplayName(name)
            .setMembers(members)
            .setDescription(description)
            .setMemberships(memberships);
    }

    updatePersistedItem(): Q.Promise<Principal> {
        return super.updatePersistedItem().then((principal: Principal) => {
            //remove after users event handling is configured and layout is updated on receiving upd from server
            this.rolesWizardStepForm.layout(principal);
            return principal;
        });
    }

    produceUpdateRequest(viewedPrincipal:Principal):UpdateGroupRequest {
        const group = <Group>viewedPrincipal;
        const key = group.getKey();
        const displayName = group.getDisplayName();
        const description = group.getDescription();

        const oldMembers = (<Group>this.getPersistedItem()).getMembers();
        const newMembers = group.getMembers();
        const addMembers = ArrayHelper.difference(newMembers, oldMembers, (a, b) => (a.toString() === b.toString()));
        const removeMembers = ArrayHelper.difference(oldMembers, newMembers, (a, b) => (a.toString() === b.toString()));

        const oldMemberships = (<Group>this.getPersistedItem()).getMemberships().map(value => value.getKey());
        const newMemberships = group.getMemberships().map(value => value.getKey());
        const addMemberships = ArrayHelper.difference(newMemberships, oldMemberships, (a, b) => (a.toString() === b.toString()));
        const removeMemberships = ArrayHelper.difference(oldMemberships, newMemberships, (a, b) => (a.toString() === b.toString()));

        return new UpdateGroupRequest()
            .setKey(key)
            .setDisplayName(displayName)
            .addMembers(addMembers)
            .removeMembers(removeMembers)
            .addMemberships(addMemberships)
            .removeMemberhips(removeMemberships)
            .setDescription(description);
    }

    assembleViewedItem(): Principal {
        const persistedGroup: Group = (<Group>this.getPersistedItem());
        // group might be a member of other group, but that is not reflected in group wizard
        const groupMemberships: any = persistedGroup.getMemberships().filter((principal: Principal) => principal.isGroup());

        return <Membership>new GroupBuilder(persistedGroup)
            .setMemberships(this.rolesWizardStepForm.getRoles().concat(groupMemberships))
            .setMembers(this.getMembersWizardStepForm().getMembersKeys())
            .setDisplayName(this.getWizardHeader().getDisplayName())
            .setDescription(this.getDescriptionWizardStepForm().getDescription())
            .build();
    }

    isPersistedEqualsViewed(): boolean {
        const persistedPrincipal: Group = (<Group>this.getPersistedItem());
        const viewedPrincipal: Group = (<Group>this.assembleViewedItem());
        // Group/User order can be different for viewed and persisted principal
        viewedPrincipal.getMembers().sort((a, b) => a.getId().localeCompare(b.getId()));
        persistedPrincipal.getMembers().sort((a, b) => a.getId().localeCompare(b.getId()));
        viewedPrincipal.getMemberships().sort((a, b) => a.getKey().getId().localeCompare(b.getKey().getId()));
        persistedPrincipal.getMemberships().sort((a, b) => a.getKey().getId().localeCompare(b.getKey().getId()));

        return viewedPrincipal.equals(persistedPrincipal);
    }

    isNewChanged(): boolean {
        return super.isNewChanged() || this.rolesWizardStepForm.getRoles().length !== 0;
    }
}
