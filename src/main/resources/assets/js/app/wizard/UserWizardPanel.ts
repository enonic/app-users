import * as Q from 'q';
import {PrincipalWizardPanel} from './PrincipalWizardPanel';
import {UserEmailWizardStepForm} from './UserEmailWizardStepForm';
import {UserPasswordWizardStepForm} from './UserPasswordWizardStepForm';
import {UserMembershipsWizardStepForm} from './UserMembershipsWizardStepForm';
import {PrincipalWizardPanelParams} from './PrincipalWizardPanelParams';
import {CreateUserRequest} from '../../graphql/principal/user/CreateUserRequest';
import {UpdateUserRequest} from '../../graphql/principal/user/UpdateUserRequest';
import {UserItemCreatedEvent} from '../event/UserItemCreatedEvent';
import {User, UserBuilder} from '../principal/User';
import {Principal} from 'lib-admin-ui/security/Principal';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {ConfirmationDialog} from 'lib-admin-ui/ui/dialog/ConfirmationDialog';
import {WizardStep} from 'lib-admin-ui/app/wizard/WizardStep';
import {ArrayHelper} from 'lib-admin-ui/util/ArrayHelper';
import {i18n} from 'lib-admin-ui/util/Messages';
import {showFeedback} from 'lib-admin-ui/notify/MessageBus';
import {StringHelper} from 'lib-admin-ui/util/StringHelper';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {WizardHeaderWithDisplayNameAndName} from 'lib-admin-ui/app/wizard/WizardHeaderWithDisplayNameAndName';

export class UserWizardPanel extends PrincipalWizardPanel {

    private userEmailWizardStepForm: UserEmailWizardStepForm;
    private userPasswordWizardStepForm: UserPasswordWizardStepForm;
    private userMembershipsWizardStepForm: UserMembershipsWizardStepForm;

    constructor(params: PrincipalWizardPanelParams) {
        super(params);

        this.addClass('user-wizard-panel');
    }

    saveChanges(): Q.Promise<Principal> {
        if (!this.isRendered() ||
            (this.userEmailWizardStepForm.isValid() && this.userPasswordWizardStepForm.isValid())) {

            return super.saveChanges();
        } else {
            return Q.fcall(() => {
                // throw errors, if present
                this.showErrors();
                return null;
            });
        }
    }

    createSteps(principal?: Principal): WizardStep[] {
        const steps: WizardStep[] = [];

        this.userEmailWizardStepForm = new UserEmailWizardStepForm(this.getParams().idProvider.getKey(), this.isSystemUserItem());
        this.userPasswordWizardStepForm = new UserPasswordWizardStepForm();
        this.userMembershipsWizardStepForm = new UserMembershipsWizardStepForm();

        if (!this.isSystemUserItem()) {
            steps.push(new WizardStep(i18n('field.user'), this.userEmailWizardStepForm));
        }
        steps.push(new WizardStep(i18n('field.authentication'), this.userPasswordWizardStepForm));
        steps.push(new WizardStep(i18n('field.rolesAndGroups'), this.userMembershipsWizardStepForm));

        return steps;
    }

    doLayout(persistedPrincipal: Principal): Q.Promise<void> {
        return super.doLayout(persistedPrincipal).then(() => {
            if (this.isRendered()) {
                const viewedPrincipal: Principal = this.assembleViewedItem();

                if (!this.isPersistedEqualsViewed()) {
                    console.warn(`Received Principal from server differs from what's viewed:`);
                    console.warn(' viewedPrincipal: ', viewedPrincipal);
                    console.warn(' persistedPrincipal: ', persistedPrincipal);

                    new ConfirmationDialog()
                        .setQuestion(i18n('dialog.principal.update'))
                        .setYesCallback(() => this.doLayoutPersistedItem(persistedPrincipal.clone()))
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
            if (principal) {
                this.decorateDeletedAction(principal.getKey());
                this.userEmailWizardStepForm.layout(principal);
                this.userPasswordWizardStepForm.layout(principal);
                this.userMembershipsWizardStepForm.layout(principal);
            }
        });
    }

    persistNewItem(): Q.Promise<Principal> {
        return this.produceCreateUserRequest().sendAndParse().then((principal: Principal) => {
            this.decorateDeletedAction(principal.getKey());

            new UserItemCreatedEvent(principal, this.getIdProvider(), this.isParentOfSameType()).fire();

            showFeedback(i18n('notify.create.user'));
            this.notifyPrincipalNamed(principal);

            this.userMembershipsWizardStepForm.layout(principal);
            this.userEmailWizardStepForm.layout(principal);
            this.userPasswordWizardStepForm.layout(principal);

            return principal;
        });
    }

    protected getWizardNameValue(): string {
        return (<User>this.getPersistedItem())?.getLogin() || super.getWizardNameValue();
    }

    produceCreateUserRequest(): CreateUserRequest {
        const wizardHeader = this.getWizardHeader();
        wizardHeader.normalizeNames();
        const login = wizardHeader.getName();
        const key = PrincipalKey.ofUser(this.getIdProvider().getKey(), login);
        const name = wizardHeader.getDisplayName();
        const email = this.userEmailWizardStepForm.getEmail();
        const password = this.userPasswordWizardStepForm.getPassword();
        const memberships = this.userMembershipsWizardStepForm.getMembershipsKeys();
        return new CreateUserRequest()
            .setKey(key)
            .setDisplayName(name)
            .setEmail(email)
            .setLogin(login)
            .setPassword(password)
            .setMemberships(memberships);
    }

    updatePersistedItem(): Q.Promise<Principal> {
        return super.updatePersistedItem().then((principal: Principal) => {
            //remove after users event handling is configured and layout is updated on receiving upd from server
            this.userMembershipsWizardStepForm.layout(principal);
            this.userEmailWizardStepForm.layout(principal);
            this.userPasswordWizardStepForm.layout(principal);
            return principal;
        });
    }

    produceUpdateRequest(viewedPrincipal: Principal): UpdateUserRequest {
        const user = <User>viewedPrincipal;
        const key = user.getKey();
        const displayName = user.getDisplayName();
        const email = user.getEmail();
        const login = user.getLogin();

        const oldMemberships = (<User>this.getPersistedItem()).getMemberships().map(value => value.getKey());
        const newMemberships = user.getMemberships().map(value => value.getKey());
        const addMemberships = ArrayHelper.difference(newMemberships, oldMemberships, (a, b) => (a.toString() === b.toString()));
        const removeMemberships = ArrayHelper.difference(oldMemberships, newMemberships, (a, b) => (a.toString() === b.toString()));

        return new UpdateUserRequest()
            .setKey(key)
            .setDisplayName(displayName)
            .setEmail(email)
            .setLogin(login)
            .addMemberships(addMemberships)
            .removeMemberships(removeMemberships);
    }

    assembleViewedItem(): Principal {
        const wizardHeader = this.getWizardHeader();
        wizardHeader.normalizeNames();
        return <Principal>new UserBuilder(this.getPersistedItem() ? <User>this.getPersistedItem() : null)
            .setEmail(this.userEmailWizardStepForm.getEmail())
            .setLogin(wizardHeader.getName())
            .setMemberships(this.userMembershipsWizardStepForm.getMemberships())
            .setDisplayName(wizardHeader.getDisplayName())
            .build();
    }

    private showErrors() {
        if (!this.userEmailWizardStepForm.isValid()) {
            this.showEmailErrors();
        }

        if (!(this.getPersistedItem() || this.userPasswordWizardStepForm.isValid())) {
            this.showPasswordErrors();
        }
    }

    private showEmailErrors() {
        const formEmail: string = this.userEmailWizardStepForm.getEmail();

        if (StringHelper.isEmpty(formEmail)) {
            throw i18n('notify.empty.email');
        } else if (!this.userEmailWizardStepForm.isValid()) {
            throw `${i18n('field.email.invalid')}.`;
        }
    }

    private showPasswordErrors() {
        const password: string = this.userPasswordWizardStepForm.getPassword();

        if (StringHelper.isEmpty(password)) {
            throw i18n('notify.empty.password');
        } else if (!this.userPasswordWizardStepForm.isValid()) {
            throw `${i18n('field.password.invalid')}.`;
        }
    }

    isPersistedEqualsViewed(): boolean {
        const persistedPrincipal = (<User>this.getPersistedItem());
        const viewedPrincipal = (<User>this.assembleViewedItem());
        // Group/User order can be different for viewed and persisted principal
        viewedPrincipal.getMemberships().sort((a, b) => {
            return a.getKey().toString().localeCompare(b.getKey().toString());
        });
        persistedPrincipal.getMemberships().sort((a, b) => {
            return a.getKey().toString().localeCompare(b.getKey().toString());
        });

        // #hack - The newly added members will have different modifiedData
        let viewedMembershipsKeys = viewedPrincipal.getMemberships().map((el) => {
            return el.getKey();
        });
        let persistedMembershipsKeys = persistedPrincipal.getMemberships().map((el) => {
            return el.getKey();
        });

        if (ObjectHelper.arrayEquals(viewedMembershipsKeys, persistedMembershipsKeys)) {
            viewedPrincipal.setMemberships(persistedPrincipal.getMemberships());
        }

        return viewedPrincipal.equals(persistedPrincipal);
    }

    isNewChanged(): boolean {
        const wizardHeader: WizardHeaderWithDisplayNameAndName = this.getWizardHeader();
        const email: string = this.userEmailWizardStepForm.getEmail();
        const password: string = this.userPasswordWizardStepForm.getPassword();
        const memberships: Principal[] = this.userMembershipsWizardStepForm.getMemberships();

        return wizardHeader.getName() !== '' ||
               wizardHeader.getDisplayName() !== '' ||
               (!!email && email !== '') ||
               (!!password && password !== '') ||
               (!!memberships && memberships.length !== 0);
    }

    private decorateDeletedAction(principalKey: PrincipalKey) {
        this.wizardActions.getDeleteAction().setEnabled(!principalKey.isSystem());
    }
}
