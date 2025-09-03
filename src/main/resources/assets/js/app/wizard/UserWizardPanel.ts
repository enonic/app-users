import Q from 'q';
import {PrincipalWizardPanel} from './PrincipalWizardPanel';
import {UserEmailWizardStepForm} from './UserEmailWizardStepForm';
import {UserPasswordWizardStepForm} from './UserPasswordWizardStepForm';
import {UserMembershipsWizardStepForm} from './UserMembershipsWizardStepForm';
import {PrincipalWizardPanelParams} from './PrincipalWizardPanelParams';
import {CreateUserRequest} from '../../graphql/principal/user/CreateUserRequest';
import {UpdateUserRequest} from '../../graphql/principal/user/UpdateUserRequest';
import {UserItemCreatedEvent} from '../event/UserItemCreatedEvent';
import {User, UserBuilder} from '../principal/User';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {ConfirmationDialog} from '@enonic/lib-admin-ui/ui/dialog/ConfirmationDialog';
import {WizardStep} from '@enonic/lib-admin-ui/app/wizard/WizardStep';
import {ArrayHelper} from '@enonic/lib-admin-ui/util/ArrayHelper';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {showFeedback} from '@enonic/lib-admin-ui/notify/MessageBus';
import {StringHelper} from '@enonic/lib-admin-ui/util/StringHelper';
import {WizardHeaderWithDisplayNameAndName} from '@enonic/lib-admin-ui/app/wizard/WizardHeaderWithDisplayNameAndName';

export class UserWizardPanel
    extends PrincipalWizardPanel {

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
        this.userEmailWizardStepForm.initialize();

        this.userPasswordWizardStepForm = new UserPasswordWizardStepForm(this.getParams().idProvider.getKey(), principal as User);
        this.userPasswordWizardStepForm.initialize();

        this.userMembershipsWizardStepForm = new UserMembershipsWizardStepForm();
        this.userMembershipsWizardStepForm.initialize();

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
                    console.warn('Received Principal from server differs from what\'s viewed:');
                    console.warn(' viewedPrincipal: ', viewedPrincipal);
                    console.warn(' persistedPrincipal: ', persistedPrincipal);

                    new ConfirmationDialog()
                        .setQuestion(i18n('dialog.principal.update'))
                        .setYesCallback(() => {
                            void this.doLayoutPersistedItem(persistedPrincipal.clone());
                        })
                        .setNoCallback(() => { /* empty */ })
                        .show();
                }

                return Q<void>(null);
            }

            return this.doLayoutPersistedItem(persistedPrincipal ? persistedPrincipal.clone() : null);
        });
    }

    protected doLayoutPersistedItem(principal: Principal): Q.Promise<void> {
        return super.doLayoutPersistedItem(principal).then(() => {
            if (principal) {
                this.decorateDeletedAction(principal.getKey());
                this.userEmailWizardStepForm.layout(principal);
                this.userPasswordWizardStepForm.layout(principal as User);
                this.userMembershipsWizardStepForm.layout(principal);
            }

            return Q(null);
        });
    }

    persistNewItem(): Q.Promise<Principal> {
        return this.produceCreateUserRequest().sendAndParse().then((principal: Principal) => {
            this.decorateDeletedAction(principal.getKey());

            new UserItemCreatedEvent(principal, this.getIdProvider(), this.isParentOfSameType()).fire();

            showFeedback(i18n('notify.create.user'));
            this.notifyUserItemNamed(principal);

            this.userMembershipsWizardStepForm.layout(principal);
            this.userEmailWizardStepForm.layout(principal);
            this.userPasswordWizardStepForm.layout(principal as User);

            return principal;
        });
    }

    protected getWizardNameValue(): string {
        return (this.getPersistedItem() as User)?.getLogin() || super.getWizardNameValue();
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
            this.userPasswordWizardStepForm.layout(principal as User);
            return principal;
        });
    }

    produceUpdateRequest(viewedPrincipal: Principal): UpdateUserRequest {
        const user: User = viewedPrincipal as User;
        const key: PrincipalKey = user.getKey();
        const displayName: string = user.getDisplayName();
        const email: string = user.getEmail();
        const login: string = user.getLogin();

        const oldMemberships: PrincipalKey[] = (this.getPersistedItem() as User).getMemberships().map(value => value.getKey());
        const newMemberships: PrincipalKey[] = user.getMemberships().map(value => value.getKey());
        const addMemberships: PrincipalKey[] = ArrayHelper.difference(newMemberships, oldMemberships,
            (a, b) => (a.toString() === b.toString()));
        const removeMemberships: PrincipalKey[] = ArrayHelper.difference(oldMemberships, newMemberships,
            (a, b) => (a.toString() === b.toString()));

        return new UpdateUserRequest()
            .setKey(key)
            .setDisplayName(displayName)
            .setEmail(email)
            .setLogin(login)
            .addMemberships(addMemberships)
            .removeMemberships(removeMemberships)
            .setPassword(this.userPasswordWizardStepForm.getPassword());
    }

    assembleViewedItem(): Principal {
        const wizardHeader: WizardHeaderWithDisplayNameAndName = this.getWizardHeader();
        wizardHeader.normalizeNames();
        return new UserBuilder(this.getPersistedItem() ? this.getPersistedItem() as User : null)
            .setEmail(this.userEmailWizardStepForm.getEmail())
            .setLogin(wizardHeader.getName())
            .setMemberships(this.userMembershipsWizardStepForm.getMemberships().sort(this.sortMemberships))
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
            throw Error(i18n('notify.empty.email'));
        } else if (!this.userEmailWizardStepForm.isValid()) {
            throw Error(`${i18n('field.email.invalid') || 'invalid'}.`);
        }
    }

    private showPasswordErrors() {
        const password: string = this.userPasswordWizardStepForm.getPassword();

        if (StringHelper.isEmpty(password)) {
            throw Error(i18n('notify.empty.password'));
        } else if (!this.userPasswordWizardStepForm.isValid()) {
            throw Error(`${i18n('field.password.invalid') || 'invalid'}.`);
        }
    }

    protected assemblePersistedItem(): Principal {
        const persistedUser: User = (this.getPersistedItem() as User);

        return persistedUser
            .newBuilder()
            .setMemberships(persistedUser.getMemberships().sort(this.sortMemberships))
            .build();
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

    private sortMemberships(a: Principal, b: Principal): number {
        return a.getKey().getId().localeCompare(b.getKey().getId());
    }
}
