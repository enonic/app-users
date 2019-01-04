import {Router} from '../Router';
import {UserItemWizardPanel} from './UserItemWizardPanel';
import {SecurityWizardStepForm} from './SecurityWizardStepForm';
import {UserStoreWizardPanelParams} from './UserStoreWizardPanelParams';
import {UserStoreWizardStepForm} from './UserStoreWizardStepForm';
import {UserStoreWizardDataLoader} from './UserStoreWizardDataLoader';
import {CreateUserStoreRequest} from '../../api/graphql/userStore/CreateUserStoreRequest';
import {UpdateUserStoreRequest} from '../../api/graphql/userStore/UpdateUserStoreRequest';
import {UserItemCreatedEvent} from '../event/UserItemCreatedEvent';
import {UserItemDeletedEvent} from '../event/UserItemDeletedEvent';
import {UserItemUpdatedEvent} from '../event/UserItemUpdatedEvent';
import {UserStore, UserStoreBuilder} from '../principal/UserStore';
import WizardStep = api.app.wizard.WizardStep;
import i18n = api.util.i18n;
import UserStoreKey = api.security.UserStoreKey;

export class UserStoreWizardPanel
    extends UserItemWizardPanel<UserStore> {

    private userStoreWizardStepForm: UserStoreWizardStepForm;

    private permissionsWizardStepForm: SecurityWizardStepForm;

    private defaultUserStore: UserStore;

    public static debug: boolean = false;

    constructor(params: UserStoreWizardPanelParams) {

        super(params);

        this.listenToUserItemEvents();
    }

    protected doLoadData(): Q.Promise<UserStore> {
        if (UserStoreWizardPanel.debug) {
            console.debug('UserStoreWizardPanel.doLoadData');
        }
        // don't call super.doLoadData to prevent saving new entity
        return new UserStoreWizardDataLoader().loadData(this.getParams())
            .then((loader) => {
                if (UserStoreWizardPanel.debug) {
                    console.debug('UserStoreWizardPanel.doLoadData: loaded data', loader);
                }
                if (loader.userStore) {
                    this.formState.setIsNew(false);
                    this.setPersistedItem(loader.userStore);
                    this.establishDeleteActionState(loader.userStore.getKey());
                }
                this.defaultUserStore = loader.defaultUserStore;
                return loader.userStore;
            });
    }

    protected createFormIcon(): api.app.wizard.FormIcon {
        let formIcon = super.createFormIcon();
        formIcon.addClass('icon-address-book');
        return formIcon;
    }

    doRenderOnDataLoaded(rendered: boolean): Q.Promise<boolean> {
        return super.doRenderOnDataLoaded(rendered).then((nextRendered) => {
            if (UserStoreWizardPanel.debug) {
                console.debug('UserStoreWizardPanel.doRenderOnDataLoaded');
            }
            this.addClass('principal-wizard-panel');

            this.getFormIcon().addClass('icon-address-book');

            return nextRendered;
        });
    }

    protected getPersistedItemPath(): string {
        return `/${this.getPersistedItem().getKey().toString()}`;
    }

    getUserItemType(): string {
        return i18n('field.userStore');
    }

    createSteps(persistedItem: UserStore): WizardStep[] {
        let steps: WizardStep[] = [];

        this.userStoreWizardStepForm = new UserStoreWizardStepForm();
        this.permissionsWizardStepForm = new SecurityWizardStepForm();

        steps.push(new WizardStep(i18n('field.userStore'), this.userStoreWizardStepForm));
        steps.push(new WizardStep(i18n('field.permissions'), this.permissionsWizardStepForm));

        return steps;
    }

    doLayout(persistedUserStore: UserStore): wemQ.Promise<void> {
        return super.doLayout(persistedUserStore).then(() => {

            if (this.isRendered()) {
                return wemQ<void>(null);
            } else {
                return this.doLayoutPersistedItem(persistedUserStore ? persistedUserStore.clone() : null);
            }

        });
    }

    protected doLayoutPersistedItem(persistedItem: UserStore): Q.Promise<void> {

        if (!!persistedItem) {
            this.getWizardHeader().setDisplayName(persistedItem.getDisplayName());
            this.userStoreWizardStepForm.layout(persistedItem);
            this.permissionsWizardStepForm.layout(persistedItem, this.defaultUserStore);
        } else {
            this.userStoreWizardStepForm.layout(this.defaultUserStore);
            this.permissionsWizardStepForm.layoutReadOnly(this.defaultUserStore);
        }

        return wemQ<void>(null);
    }

    persistNewItem(): wemQ.Promise<UserStore> {
        this.lock();
        return this.produceCreateUserStoreRequest().sendAndParse().then((userStore: UserStore) => {

            this.unlock();
            api.notify.showFeedback('User store was created');
            new UserItemCreatedEvent(null, userStore).fire();

            return userStore;
        });
    }

    postPersistNewItem(userStore: UserStore): wemQ.Promise<UserStore> {
        Router.setHash('edit/' + userStore.getKey());

        return wemQ(userStore);
    }

    updatePersistedItem(): wemQ.Promise<UserStore> {
        this.lock();
        return this.produceUpdateUserStoreRequest(this.assembleViewedUserStore()).sendAndParse().then((userStore: UserStore) => {
            this.unlock();
            api.notify.showFeedback('User store was updated');
            new UserItemUpdatedEvent(null, userStore).fire();

            return userStore;
        });
    }

    isNewChanged(): boolean {
        const wizardHeader = this.getWizardHeader();
        const idProviderConfig = this.userStoreWizardStepForm.getIdProviderConfig();
        return wizardHeader.getName() !== '' ||
               wizardHeader.getDisplayName() !== '' ||
               !api.ObjectHelper.stringEquals(this.userStoreWizardStepForm.getDescription(), this.defaultUserStore.getDescription()) ||
               !(!idProviderConfig || idProviderConfig.equals(this.defaultUserStore.getIdProviderConfig())) ||
               !this.permissionsWizardStepForm.getPermissions().equals(this.defaultUserStore.getPermissions());
    }

    private assembleViewedUserStore(): UserStore {
        return <UserStore>new UserStoreBuilder().setIdProviderConfig(
            this.userStoreWizardStepForm.getIdProviderConfig()).setPermissions(this.permissionsWizardStepForm.getPermissions()).setKey(
            this.getPersistedItem().getKey().toString()).setDisplayName(this.getWizardHeader().getDisplayName()).setDescription(
            this.userStoreWizardStepForm.getDescription()).build();
    }

    private produceCreateUserStoreRequest(): CreateUserStoreRequest {
        let wizardHeader = this.getWizardHeader();
        wizardHeader.normalizeNames();
        let key = new UserStoreKey(wizardHeader.getName());
        let name = wizardHeader.getDisplayName();
        let description = this.userStoreWizardStepForm.getDescription();
        let idProviderConfig = this.userStoreWizardStepForm.getIdProviderConfig();
        let permissions = this.permissionsWizardStepForm.getPermissions();

        return new CreateUserStoreRequest()
            .setDisplayName(name)
            .setKey(key)
            .setDescription(description)
            .setIdProviderConfig(idProviderConfig)
            .setPermissions(permissions);
    }

    private listenToUserItemEvents() {

        let principalCreatedHandler = (event: UserItemCreatedEvent) => {
            if (!this.getPersistedItem()) { // skip if user store is not persisted yet
                return;
            }

            let principal = event.getPrincipal();
            let isCreatedInCurrentUserStore = !!principal && (principal.isUser() || principal.isGroup())
                                              && event.getUserStore().getKey().equals(this.getPersistedItem().getKey());

            if (isCreatedInCurrentUserStore) {
                this.wizardActions.getDeleteAction().setEnabled(false);
            }
        };

        let principalDeletedHandler = (event: UserItemDeletedEvent) => {
            // skip if user store is not persisted yet or if anything except users or roles was deleted
            if (!this.getPersistedItem() || !event.getPrincipals()) {
                return;
            }

            this.getPersistedItem().isDeletable().then((result: boolean) => {
                this.wizardActions.getDeleteAction().setEnabled(result);
            });
        };

        UserItemCreatedEvent.on(principalCreatedHandler);
        UserItemDeletedEvent.on(principalDeletedHandler);

        this.onClosed(() => {
            UserItemCreatedEvent.un(principalCreatedHandler);
            UserItemDeletedEvent.un(principalDeletedHandler);
        });

    }

    protected updateHash() {
        if (this.getPersistedItem()) {
            Router.setHash('edit/' + this.getPersistedItem().getKey());
        } else {
            Router.setHash('new/');
        }
    }

    private establishDeleteActionState(key: UserStoreKey) {
        if (key) {
            UserStore.checkOnDeletable(key).then((result: boolean) => {
                this.wizardActions.getDeleteAction().setEnabled(result);
            }).catch(api.DefaultErrorHandler.handle).done();
        }
    }

    isPersistedEqualsViewed(): boolean {
        const viewedPrincipal = this.assembleViewedUserStore();
        return viewedPrincipal.equals(this.getPersistedItem());
    }

    private produceUpdateUserStoreRequest(viewedUserStore: UserStore): UpdateUserStoreRequest {
        let key = this.getPersistedItem().getKey();
        let name = viewedUserStore.getDisplayName();
        let description = viewedUserStore.getDescription();
        let idProviderConfig = viewedUserStore.getIdProviderConfig();
        let permissions = viewedUserStore.getPermissions();

        return new UpdateUserStoreRequest()
            .setKey(key)
            .setDisplayName(name)
            .setDescription(description)
            .setIdProviderConfig(idProviderConfig)
            .setPermissions(permissions);
    }

    saveChanges(): wemQ.Promise<UserStore> {
        if (this.isRendered()) {
            if (!this.userStoreWizardStepForm.isValid()) {
                return wemQ.fcall(() => {
                    throw i18n('notify.invalid.idProviderConfig');
                });
            }
        }
        return super.saveChanges();
    }

}
