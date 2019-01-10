import {Router} from '../Router';
import {UserItemWizardPanel} from './UserItemWizardPanel';
import {SecurityWizardStepForm} from './SecurityWizardStepForm';
import {IdProviderWizardPanelParams} from './IdProviderWizardPanelParams';
import {IdProviderWizardStepForm} from './IdProviderWizardStepForm';
import {IdProviderWizardDataLoader} from './IdProviderWizardDataLoader';
import {CreateIdProviderRequest} from '../../api/graphql/userStore/CreateIdProviderRequest';
import {UpdateIdProviderRequest} from '../../api/graphql/userStore/UpdateIdProviderRequest';
import {UserItemCreatedEvent} from '../event/UserItemCreatedEvent';
import {UserItemDeletedEvent} from '../event/UserItemDeletedEvent';
import {UserItemUpdatedEvent} from '../event/UserItemUpdatedEvent';
import {IdProvider, IdProviderBuilder} from '../principal/IdProvider';
import WizardStep = api.app.wizard.WizardStep;
import i18n = api.util.i18n;
import IdProviderKey = api.security.IdProviderKey;

export class IdProviderWizardPanel
    extends UserItemWizardPanel<IdProvider> {

    private userStoreWizardStepForm: IdProviderWizardStepForm;

    private permissionsWizardStepForm: SecurityWizardStepForm;

    private defaultUserStore: IdProvider;

    public static debug: boolean = false;

    constructor(params: IdProviderWizardPanelParams) {

        super(params);

        this.listenToUserItemEvents();
    }

    doRenderOnDataLoaded(rendered: boolean): Q.Promise<boolean> {
        return super.doRenderOnDataLoaded(rendered).then((nextRendered) => {
            if (IdProviderWizardPanel.debug) {
                console.debug('IdProviderWizardPanel.doRenderOnDataLoaded');
            }
            this.addClass('principal-wizard-panel');

            this.getFormIcon().addClass('icon-address-book');

            return nextRendered;
        });
    }

    protected createFormIcon(): api.app.wizard.FormIcon {
        let formIcon = super.createFormIcon();
        formIcon.addClass('icon-address-book');
        return formIcon;
    }

    createSteps(persistedItem: IdProvider): WizardStep[] {
        let steps: WizardStep[] = [];

        this.userStoreWizardStepForm = new IdProviderWizardStepForm();
        this.permissionsWizardStepForm = new SecurityWizardStepForm();

        steps.push(new WizardStep(i18n('field.userStore'), this.userStoreWizardStepForm));
        steps.push(new WizardStep(i18n('field.permissions'), this.permissionsWizardStepForm));

        return steps;
    }

    protected getPersistedItemPath(): string {
        return `/${this.getPersistedItem().getKey().toString()}`;
    }

    getUserItemType(): string {
        return i18n('field.userStore');
    }

    doLayout(persistedIdProvider: IdProvider): wemQ.Promise<void> {
        return super.doLayout(persistedIdProvider).then(() => {

            if (this.isRendered()) {
                return wemQ<void>(null);
            } else {
                return this.doLayoutPersistedItem(persistedIdProvider ? persistedIdProvider.clone() : null);
            }

        });
    }

    persistNewItem(): wemQ.Promise<IdProvider> {
        this.lock();
        return this.produceCreateUserStoreRequest().sendAndParse().then((userStore: IdProvider) => {

            this.unlock();
            api.notify.showFeedback('User store was created');
            new UserItemCreatedEvent(null, userStore).fire();

            return userStore;
        });
    }

    postPersistNewItem(userStore: IdProvider): wemQ.Promise<IdProvider> {
        Router.setHash('edit/' + userStore.getKey());

        return wemQ(userStore);
    }

    updatePersistedItem(): wemQ.Promise<IdProvider> {
        this.lock();
        return this.produceUpdateUserStoreRequest(this.assembleViewedUserStore()).sendAndParse().then((userStore: IdProvider) => {
            this.unlock();
            api.notify.showFeedback('User store was updated');
            new UserItemUpdatedEvent(null, userStore).fire();

            return userStore;
        });
    }

    saveChanges(): wemQ.Promise<IdProvider> {
        if (this.isRendered()) {
            if (!this.userStoreWizardStepForm.isValid()) {
                return wemQ.fcall(() => {
                    throw i18n('notify.invalid.idProviderConfig');
                });
            }
        }
        return super.saveChanges();
    }

    protected doLoadData(): Q.Promise<IdProvider> {
        if (IdProviderWizardPanel.debug) {
            console.debug('IdProviderWizardPanel.doLoadData');
        }
        // don't call super.doLoadData to prevent saving new entity
        return new IdProviderWizardDataLoader().loadData(this.getParams())
            .then((loader) => {
                if (IdProviderWizardPanel.debug) {
                    console.debug('IdProviderWizardPanel.doLoadData: loaded data', loader);
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

    isNewChanged(): boolean {
        const wizardHeader = this.getWizardHeader();
        const idProviderConfig = this.userStoreWizardStepForm.getIdProviderConfig();
        return wizardHeader.getName() !== '' ||
               wizardHeader.getDisplayName() !== '' ||
               !api.ObjectHelper.stringEquals(this.userStoreWizardStepForm.getDescription(), this.defaultUserStore.getDescription()) ||
               !(!idProviderConfig || idProviderConfig.equals(this.defaultUserStore.getIdProviderConfig())) ||
               !this.permissionsWizardStepForm.getPermissions().equals(this.defaultUserStore.getPermissions());
    }

    protected doLayoutPersistedItem(persistedItem: IdProvider): Q.Promise<void> {

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

    private assembleViewedUserStore(): IdProvider {
        return <IdProvider>new IdProviderBuilder().setIdProviderConfig(
            this.userStoreWizardStepForm.getIdProviderConfig()).setPermissions(this.permissionsWizardStepForm.getPermissions()).setKey(
            this.getPersistedItem().getKey().toString()).setDisplayName(this.getWizardHeader().getDisplayName()).setDescription(
            this.userStoreWizardStepForm.getDescription()).build();
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

    private produceCreateUserStoreRequest(): CreateIdProviderRequest {
        let wizardHeader = this.getWizardHeader();
        wizardHeader.normalizeNames();
        let key = new IdProviderKey(wizardHeader.getName());
        let name = wizardHeader.getDisplayName();
        let description = this.userStoreWizardStepForm.getDescription();
        let idProviderConfig = this.userStoreWizardStepForm.getIdProviderConfig();
        let permissions = this.permissionsWizardStepForm.getPermissions();

        return new CreateIdProviderRequest()
            .setDisplayName(name)
            .setKey(key)
            .setDescription(description)
            .setIdProviderConfig(idProviderConfig)
            .setPermissions(permissions);
    }

    isPersistedEqualsViewed(): boolean {
        const viewedPrincipal = this.assembleViewedUserStore();
        return viewedPrincipal.equals(this.getPersistedItem());
    }

    private establishDeleteActionState(key: IdProviderKey) {
        if (key) {
            IdProvider.checkOnDeletable(key).then((result: boolean) => {
                this.wizardActions.getDeleteAction().setEnabled(result);
            }).catch(api.DefaultErrorHandler.handle).done();
        }
    }

    private produceUpdateUserStoreRequest(viewedUserStore: IdProvider): UpdateIdProviderRequest {
        let key = this.getPersistedItem().getKey();
        let name = viewedUserStore.getDisplayName();
        let description = viewedUserStore.getDescription();
        let idProviderConfig = viewedUserStore.getIdProviderConfig();
        let permissions = viewedUserStore.getPermissions();

        return new UpdateIdProviderRequest()
            .setKey(key)
            .setDisplayName(name)
            .setDescription(description)
            .setIdProviderConfig(idProviderConfig)
            .setPermissions(permissions);
    }

}
