import * as Q from 'q';
import {PrincipalDescriptionWizardStepForm} from './PrincipalDescriptionWizardStepForm';
import {PrincipalWizardPanel} from './PrincipalWizardPanel';
import {PrincipalWizardPanelParams} from './PrincipalWizardPanelParams';
import {PrincipalMembersWizardStepForm} from './PrincipalMembersWizardStepForm';
import {Principal} from 'lib-admin-ui/security/Principal';
import {ConfirmationDialog} from 'lib-admin-ui/ui/dialog/ConfirmationDialog';
import {i18n} from 'lib-admin-ui/util/Messages';

export class GroupRoleWizardPanel extends PrincipalWizardPanel {

    private descriptionWizardStepForm: PrincipalDescriptionWizardStepForm;
    private membersWizardStepForm: PrincipalMembersWizardStepForm;

    constructor(membersWizardStepForm: PrincipalMembersWizardStepForm, params: PrincipalWizardPanelParams) {
        super(params);

        this.descriptionWizardStepForm = new PrincipalDescriptionWizardStepForm();
        this.membersWizardStepForm = membersWizardStepForm;

        this.addClass('group-role-wizard-panel');
    }

    getDescriptionWizardStepForm(): PrincipalDescriptionWizardStepForm {
        return this.descriptionWizardStepForm;
    }

    getMembersWizardStepForm(): PrincipalMembersWizardStepForm {
        return this.membersWizardStepForm;
    }

    doLayout(persistedPrincipal: Principal): Q.Promise<void> {

        return super.doLayout(persistedPrincipal).then(() => {

            if (this.isRendered()) {

                let viewedPrincipal = this.assembleViewedItem();
                if (!this.isPersistedEqualsViewed()) {

                    console.warn(`Received Principal from server differs from what's viewed:`);
                    console.warn(' viewedPrincipal: ', viewedPrincipal);
                    console.warn(' persistedPrincipal: ', persistedPrincipal);

                    new ConfirmationDialog()
                        .setQuestion(i18n('dialog.principal.update'))
                        .setYesCallback(() => this.doLayoutPersistedItem(persistedPrincipal ? persistedPrincipal.clone() : null))
                        .setNoCallback(() => { /* empty */ })
                        .show();
                }

                return Q<void>(null);
            } else {
                return this.doLayoutPersistedItem(persistedPrincipal ? persistedPrincipal.clone() : null);
            }

        });
    }

    protected doLayoutPersistedItem(principal: Principal): Q.Promise<void> {

        return super.doLayoutPersistedItem(principal).then(() => {
            if (!!principal) {
                this.getDescriptionWizardStepForm().layout(principal);
                this.getMembersWizardStepForm().layout(principal);
            }
        });
    }

    isNewChanged(): boolean {
        const wizardHeader = this.getWizardHeader();
        return wizardHeader.getName() !== '' ||
               wizardHeader.getDisplayName() !== '' ||
               this.descriptionWizardStepForm.getDescription() !== '' ||
               this.membersWizardStepForm.getMembers().length !== 0;
    }
}
