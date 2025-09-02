import Q from 'q';
import {MembersWizardPanel} from './MembersWizardPanel';
import {PrincipalWizardPanelParams} from './PrincipalWizardPanelParams';
import {CreateGroupRequest} from '../../graphql/principal/group/CreateGroupRequest';
import {UpdateGroupRequest} from '../../graphql/principal/group/UpdateGroupRequest';
import {UserItemCreatedEvent} from '../event/UserItemCreatedEvent';
import {Group, GroupBuilder} from '../principal/Group';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {WizardStep} from '@enonic/lib-admin-ui/app/wizard/WizardStep';
import {ArrayHelper} from '@enonic/lib-admin-ui/util/ArrayHelper';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {showFeedback} from '@enonic/lib-admin-ui/notify/MessageBus';
import {Members} from '../principal/Members';
import {RolesWizardStepForm} from './RolesWizardStepForm';
import {WizardHeaderWithDisplayNameAndName} from '@enonic/lib-admin-ui/app/wizard/WizardHeaderWithDisplayNameAndName';

export class GroupWizardPanel
    extends MembersWizardPanel {

    private rolesWizardStepForm: RolesWizardStepForm;

    constructor(params: PrincipalWizardPanelParams) {
        super(params);

        this.addClass('group-wizard-panel');
    }

    createSteps(principal?: Principal): WizardStep[] {
        const steps: WizardStep[] = [];

        const descriptionStep = this.getDescriptionWizardStepForm();
        const membersStep = this.getMembersWizardStepForm();
        this.rolesWizardStepForm = new RolesWizardStepForm();
        this.rolesWizardStepForm.initialize();

        steps.push(new WizardStep(i18n('field.groups'), descriptionStep));
        steps.push(new WizardStep(i18n('field.members'), membersStep));
        steps.push(new WizardStep(i18n('field.roles'), this.rolesWizardStepForm));

        return steps;
    }

    protected doLayoutPersistedItem(principal: Members): Q.Promise<void> {
        return super.doLayoutPersistedItem(principal).then(() => {
            if (principal) {
                this.rolesWizardStepForm.layout(principal);
            }

            return Q(null);
        });
    }

    persistNewItem(): Q.Promise<Principal> {
        return this.produceCreateGroupRequest().sendAndParse().then((principal: Principal) => {
            showFeedback(i18n('notify.create.group'));
            new UserItemCreatedEvent(principal, this.getIdProvider(), this.isParentOfSameType()).fire();
            this.notifyUserItemNamed(principal);

            (this.getMembersWizardStepForm().getLoader()).skipPrincipal(principal.getKey());

            return principal;
        });
    }

    produceCreateGroupRequest(): CreateGroupRequest {
        const wizardHeader: WizardHeaderWithDisplayNameAndName = this.getWizardHeader();
        wizardHeader.normalizeNames();

        const key: PrincipalKey = PrincipalKey.ofGroup(this.getIdProvider().getKey(), wizardHeader.getName());
        const name: string = wizardHeader.getDisplayName();
        const members: PrincipalKey[] = this.getMembersWizardStepForm().getMembersKeys();
        const description: string = this.getDescriptionWizardStepForm().getDescription();
        const memberships: PrincipalKey[] = this.rolesWizardStepForm.getRolesKeys();

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

    produceUpdateRequest(viewedPrincipal: Principal): UpdateGroupRequest {
        const group: Group = viewedPrincipal as Group;
        const key: PrincipalKey = group.getKey();
        const displayName: string = group.getDisplayName();
        const description: string = group.getDescription();

        const oldMembers: PrincipalKey[] = (this.getPersistedItem() as Group).getMembers();
        const newMembers: PrincipalKey[] = group.getMembers();
        const addMembers: PrincipalKey[] = ArrayHelper.difference(newMembers, oldMembers, (a, b) => (a.toString() === b.toString()));
        const removeMembers: PrincipalKey[] = ArrayHelper.difference(oldMembers, newMembers, (a, b) => (a.toString() === b.toString()));

        const oldMemberships: PrincipalKey[] = (this.getPersistedItem() as Group).getMemberships().map(value => value.getKey());
        const newMemberships: PrincipalKey[] = group.getMemberships().map(value => value.getKey());
        const addMemberships: PrincipalKey[] = ArrayHelper.difference(newMemberships, oldMemberships,
            (a, b) => (a.toString() === b.toString()));
        const removeMemberships: PrincipalKey[] = ArrayHelper.difference(oldMemberships, newMemberships,
            (a, b) => (a.toString() === b.toString()));

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
        const persistedGroup: Group = (this.getPersistedItem() as Group);
        // group might be a member of other group, but that is not reflected in group wizard
        const groupMemberships: Principal[] = persistedGroup.getMemberships().filter((principal: Principal) => principal.isGroup());

        return new GroupBuilder(persistedGroup)
            .setMemberships(this.rolesWizardStepForm.getRoles().concat(groupMemberships).sort(this.sortMemberships))
            .setMembers(this.getMembersWizardStepForm().getMembersKeys().sort(this.sortMembers))
            .setDisplayName(this.getWizardHeader().getDisplayName())
            .setDescription(this.getDescriptionWizardStepForm().getDescription())
            .build() as Members;
    }

    protected assemblePersistedItem(): Principal {
        const persistedGroup: Group = (this.getPersistedItem() as Group);

        return persistedGroup
            .newBuilder()
            .setMemberships(persistedGroup.getMemberships().sort(this.sortMemberships))
            .setMembers(persistedGroup.getMembers().sort(this.sortMembers))
            .build();
    }

    isNewChanged(): boolean {
        return super.isNewChanged() || this.rolesWizardStepForm.getRoles().length !== 0;
    }

    private sortMemberships(a: Principal, b: Principal): number {
        return a.getKey().getId().localeCompare(b.getKey().getId());
    }
}
