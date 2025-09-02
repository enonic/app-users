import Q from 'q';
import {PrincipalDescriptionWizardStepForm} from './PrincipalDescriptionWizardStepForm';
import {PrincipalWizardPanel} from './PrincipalWizardPanel';
import {PrincipalWizardPanelParams} from './PrincipalWizardPanelParams';
import {MembersWizardStepForm} from './MembersWizardStepForm';
import {ConfirmationDialog} from '@enonic/lib-admin-ui/ui/dialog/ConfirmationDialog';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {Members} from '../principal/Members';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {WizardHeaderWithDisplayNameAndName} from '@enonic/lib-admin-ui/app/wizard/WizardHeaderWithDisplayNameAndName';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';

export class MembersWizardPanel extends PrincipalWizardPanel {

    private readonly descriptionWizardStepForm: PrincipalDescriptionWizardStepForm;
    private readonly membersWizardStepForm: MembersWizardStepForm;

    constructor(params: PrincipalWizardPanelParams) {
        super(params);

        this.descriptionWizardStepForm = new PrincipalDescriptionWizardStepForm();
        this.descriptionWizardStepForm.initialize();

        this.membersWizardStepForm = new MembersWizardStepForm();
        this.membersWizardStepForm.initialize();

        this.addClass('membership-wizard-panel');
    }

    getDescriptionWizardStepForm(): PrincipalDescriptionWizardStepForm {
        return this.descriptionWizardStepForm;
    }

    getMembersWizardStepForm(): MembersWizardStepForm {
        return this.membersWizardStepForm;
    }

    doLayout(persistedPrincipal: Members): Q.Promise<void> {
        return super.doLayout(persistedPrincipal).then(() => {
            if (this.isRendered()) {
                const viewedPrincipal: Principal = this.assembleViewedItem();

                if (!this.isPersistedEqualsViewed()) {
                    console.warn('Received Principal from server differs from what\'s viewed:');
                    console.warn(' viewedPrincipal: ', viewedPrincipal);
                    console.warn(' persistedPrincipal: ', persistedPrincipal);

                    new ConfirmationDialog()
                        .setQuestion(i18n('dialog.principal.update'))
                        .setYesCallback(() => {
                            void this.doLayoutPersistedItem(persistedPrincipal ? persistedPrincipal.clone() : null);
                        })
                        .setNoCallback(() => { /* empty */ })
                        .show();
                }

                return Q<void>(null);
            }

            return this.doLayoutPersistedItem(persistedPrincipal ? persistedPrincipal.clone() : null);
        });
    }

    protected doLayoutPersistedItem(principal: Members): Q.Promise<void> {
        return super.doLayoutPersistedItem(principal).then(() => {
            if (!!principal) {
                this.getDescriptionWizardStepForm().layout(principal);
                this.getMembersWizardStepForm().layout(principal);
            }

            return Q(null);
        });
    }

    isNewChanged(): boolean {
        const wizardHeader: WizardHeaderWithDisplayNameAndName = this.getWizardHeader();

        return wizardHeader.getName() !== '' ||
               wizardHeader.getDisplayName() !== '' ||
               this.descriptionWizardStepForm.getDescription() !== '' ||
               this.membersWizardStepForm.getMembersKeys().length !== 0;
    }

    protected sortMembers(a: PrincipalKey, b: PrincipalKey): number {
        return a.getId().localeCompare(b.getId());
    }
}
