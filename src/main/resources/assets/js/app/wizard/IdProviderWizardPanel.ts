import {Router} from '../Router';
import {UserItemWizardPanel} from './UserItemWizardPanel';
import {SecurityWizardStepForm} from './SecurityWizardStepForm';
import {IdProviderWizardPanelParams} from './IdProviderWizardPanelParams';
import {IdProviderWizardStepForm} from './IdProviderWizardStepForm';
import {IdProviderWizardDataLoader} from './IdProviderWizardDataLoader';
import {CreateIdProviderRequest} from '../../api/graphql/idprovider/CreateIdProviderRequest';
import {UpdateIdProviderRequest} from '../../api/graphql/idprovider/UpdateIdProviderRequest';
import {UserItemCreatedEvent} from '../event/UserItemCreatedEvent';
import {UserItemDeletedEvent} from '../event/UserItemDeletedEvent';
import {UserItemUpdatedEvent} from '../event/UserItemUpdatedEvent';
import {IdProvider, IdProviderBuilder} from '../principal/IdProvider';
import WizardStep = api.app.wizard.WizardStep;
import i18n = api.util.i18n;
import IdProviderKey = api.security.IdProviderKey;

export class IdProviderWizardPanel
    extends UserItemWizardPanel<IdProvider> {

    private idProviderWizardStepForm: IdProviderWizardStepForm;

    private permissionsWizardStepForm: SecurityWizardStepForm;

    private defaultIdProvider: IdProvider;

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

        this.idProviderWizardStepForm = new IdProviderWizardStepForm();
        this.permissionsWizardStepForm = new SecurityWizardStepForm();

        steps.push(new WizardStep(i18n('field.idProvider'), this.idProviderWizardStepForm));
        steps.push(new WizardStep(i18n('field.permissions'), this.permissionsWizardStepForm));

        return steps;
    }

    protected getPersistedItemPath(): string {
        return `/${this.getPersistedItem().getKey().toString()}`;
    }

    getUserItemType(): string {
        return i18n('field.idProvider');
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
        return this.produceCreateIdProviderRequest().sendAndParse().then((idProvider: IdProvider) => {

            this.unlock();
            api.notify.showFeedback('Id provider was created');
            new UserItemCreatedEvent(null, idProvider).fire();

            return idProvider;
        });
    }

    postPersistNewItem(idProvider: IdProvider): wemQ.Promise<IdProvider> {
        Router.setHash('edit/' + idProvider.getKey());

        return wemQ(idProvider);
    }

    updatePersistedItem(): wemQ.Promise<IdProvider> {
        this.lock();
        return this.produceUpdateIdProviderRequest(this.assembleViewedIdProvider()).sendAndParse().then((idProvider: IdProvider) => {
            this.unlock();
            api.notify.showFeedback('Id provider was updated');
            new UserItemUpdatedEvent(null, idProvider).fire();

            return idProvider;
        });
    }

    saveChanges(): wemQ.Promise<IdProvider> {
        if (this.isRendered()) {
            if (!this.idProviderWizardStepForm.isValid()) {
                return wemQ.fcall(() => {
                    throw i18n('notify.invalid.idProviderConfig');
                });
            }
        }
        return super.saveChanges();
    }

    isNewChanged(): boolean {
        const wizardHeader = this.getWizardHeader();
        const idProviderConfig = this.idProviderWizardStepForm.getIdProviderConfig();
        return wizardHeader.getName() !== '' ||
               wizardHeader.getDisplayName() !== '' ||
               !api.ObjectHelper.stringEquals(this.idProviderWizardStepForm.getDescription(), this.defaultIdProvider.getDescription()) ||
               !(!idProviderConfig || idProviderConfig.equals(this.defaultIdProvider.getIdProviderConfig())) ||
               !this.permissionsWizardStepForm.getPermissions().equals(this.defaultIdProvider.getPermissions());
    }

    isPersistedEqualsViewed(): boolean {
        const viewedPrincipal = this.assembleViewedIdProvider();
        return viewedPrincipal.equals(this.getPersistedItem());
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
                if (loader.idProvider) {
                    this.formState.setIsNew(false);
                    this.setPersistedItem(loader.idProvider);
                    this.establishDeleteActionState(loader.idProvider.getKey());
                }
                this.defaultIdProvider = loader.defaultIdProvider;
                return loader.idProvider;
            });
    }

    protected doLayoutPersistedItem(persistedItem: IdProvider): Q.Promise<void> {

        if (!!persistedItem) {
            this.getWizardHeader().setDisplayName(persistedItem.getDisplayName());
            this.idProviderWizardStepForm.layout(persistedItem);
            this.permissionsWizardStepForm.layout(persistedItem, this.defaultIdProvider);
        } else {
            this.idProviderWizardStepForm.layout(this.defaultIdProvider);
            this.permissionsWizardStepForm.layoutReadOnly(this.defaultIdProvider);
        }

        return wemQ<void>(null);
    }

    protected updateHash() {
        if (this.getPersistedItem()) {
            Router.setHash('edit/' + this.getPersistedItem().getKey());
        } else {
            Router.setHash('new/');
        }
    }

    private assembleViewedIdProvider(): IdProvider {
        return <IdProvider>new IdProviderBuilder().setIdProviderConfig(
            this.idProviderWizardStepForm.getIdProviderConfig()).setPermissions(this.permissionsWizardStepForm.getPermissions()).setKey(
            this.getPersistedItem().getKey().toString()).setDisplayName(this.getWizardHeader().getDisplayName()).setDescription(
            this.idProviderWizardStepForm.getDescription()).build();
    }

    private listenToUserItemEvents() {

        let principalCreatedHandler = (event: UserItemCreatedEvent) => {
            if (!this.getPersistedItem()) { // skip if id provider is not persisted yet
                return;
            }

            let principal = event.getPrincipal();
            let isCreatedInCurrentIdProvider = !!principal && (principal.isUser() || principal.isGroup())
                                               && event.getIdProvider().getKey().equals(this.getPersistedItem().getKey());

            if (isCreatedInCurrentIdProvider) {
                this.wizardActions.getDeleteAction().setEnabled(false);
            }
        };

        let principalDeletedHandler = (event: UserItemDeletedEvent) => {
            // skip if id provider is not persisted yet or if anything except users or roles was deleted
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

    private produceCreateIdProviderRequest(): CreateIdProviderRequest {
        let wizardHeader = this.getWizardHeader();
        wizardHeader.normalizeNames();
        let key = new IdProviderKey(wizardHeader.getName());
        let name = wizardHeader.getDisplayName();
        let description = this.idProviderWizardStepForm.getDescription();
        let idProviderConfig = this.idProviderWizardStepForm.getIdProviderConfig();
        let permissions = this.permissionsWizardStepForm.getPermissions();

        return new CreateIdProviderRequest()
            .setDisplayName(name)
            .setKey(key)
            .setDescription(description)
            .setIdProviderConfig(idProviderConfig)
            .setPermissions(permissions);
    }

    private establishDeleteActionState(key: IdProviderKey) {
        if (key) {
            IdProvider.checkOnDeletable(key).then((result: boolean) => {
                this.wizardActions.getDeleteAction().setEnabled(result);
            }).catch(api.DefaultErrorHandler.handle).done();
        }
    }

    private produceUpdateIdProviderRequest(viewedIdProvider: IdProvider): UpdateIdProviderRequest {
        let key = this.getPersistedItem().getKey();
        let name = viewedIdProvider.getDisplayName();
        let description = viewedIdProvider.getDescription();
        let idProviderConfig = viewedIdProvider.getIdProviderConfig();
        let permissions = viewedIdProvider.getPermissions();

        return new UpdateIdProviderRequest()
            .setKey(key)
            .setDisplayName(name)
            .setDescription(description)
            .setIdProviderConfig(idProviderConfig)
            .setPermissions(permissions);
    }

}
