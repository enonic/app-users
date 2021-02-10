import * as Q from 'q';
import {PrincipalDescriptionWizardStepForm} from './PrincipalDescriptionWizardStepForm';
import {PrincipalWizardPanel} from './PrincipalWizardPanel';
import {PrincipalWizardPanelParams} from './PrincipalWizardPanelParams';
import {MembershipWizardStepForm} from './MembershipWizardStepForm';
import {Principal} from 'lib-admin-ui/security/Principal';
import {ConfirmationDialog} from 'lib-admin-ui/ui/dialog/ConfirmationDialog';
import {i18n} from 'lib-admin-ui/util/Messages';
import {Membership} from '../principal/Membership';

export class MembershipWizardPanel extends PrincipalWizardPanel {

    private readonly descriptionWizardStepForm: PrincipalDescriptionWizardStepForm;
    private readonly membersWizardStepForm: MembershipWizardStepForm;

    constructor(membersWizardStepForm: MembershipWizardStepForm, params: PrincipalWizardPanelParams) {
        super(params);

        this.descriptionWizardStepForm = new PrincipalDescriptionWizardStepForm();
        this.membersWizardStepForm = membersWizardStepForm;

        this.addClass('membership-wizard-panel');
    }

    getDescriptionWizardStepForm(): PrincipalDescriptionWizardStepForm {
        return this.descriptionWizardStepForm;
    }

    getMembersWizardStepForm(): MembershipWizardStepForm {
        return this.membersWizardStepForm;
    }

    doLayout(persistedPrincipal: Membership): Q.Promise<void> {

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

    protected doLayoutPersistedItem(principal: Membership): Q.Promise<void> {

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
               this.membersWizardStepForm.getMembersKeys().length !== 0;
    }
}
