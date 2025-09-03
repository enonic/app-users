import Q from 'q';
import {Router} from '../Router';
import {UserItemWizardPanel} from './UserItemWizardPanel';
import {SecurityWizardStepForm} from './SecurityWizardStepForm';
import {IdProviderWizardPanelParams} from './IdProviderWizardPanelParams';
import {IdProviderWizardStepForm} from './IdProviderWizardStepForm';
import {IdProviderWizardDataLoader} from './IdProviderWizardDataLoader';
import {CreateIdProviderRequest} from '../../graphql/idprovider/CreateIdProviderRequest';
import {UpdateIdProviderRequest} from '../../graphql/idprovider/UpdateIdProviderRequest';
import {UserItemCreatedEvent} from '../event/UserItemCreatedEvent';
import {UserItemDeletedEvent} from '../event/UserItemDeletedEvent';
import {UserItemUpdatedEvent} from '../event/UserItemUpdatedEvent';
import {IdProvider, IdProviderBuilder} from '../principal/IdProvider';
import {WizardStep} from '@enonic/lib-admin-ui/app/wizard/WizardStep';
import {IdProviderKey} from '@enonic/lib-admin-ui/security/IdProviderKey';
import {FormIcon} from '@enonic/lib-admin-ui/app/wizard/FormIcon';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {showFeedback} from '@enonic/lib-admin-ui/notify/MessageBus';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {IdProviderWizardActions} from './IdProviderWizardActions';
import {WizardHeaderWithDisplayNameAndName} from '@enonic/lib-admin-ui/app/wizard/WizardHeaderWithDisplayNameAndName';
import {IdProviderConfig} from '@enonic/lib-admin-ui/security/IdProviderConfig';
import {IdProviderAccessControlList} from '../access/IdProviderAccessControlList';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {DeleteUserItemRequest} from '../../graphql/useritem/DeleteUserItemRequest';
import {DeleteIdProviderRequest} from '../../graphql/idprovider/DeleteIdProviderRequest';
import {DeleteUserItemResult} from '../../graphql/useritem/DeleteUserItemResult';
import {UserItemKey} from '@enonic/lib-admin-ui/security/UserItemKey';

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

    protected createWizardActions(): IdProviderWizardActions {
        return new IdProviderWizardActions(this);
    }

    doRenderOnDataLoaded(rendered: boolean): Q.Promise<boolean> {
        return super.doRenderOnDataLoaded(rendered).then((nextRendered) => {
            if (IdProviderWizardPanel.debug) {
                console.debug('IdProviderWizardPanel.doRenderOnDataLoaded');
            }

            this.addClass('principal-wizard-panel id-provider-wizard-panel');
            this.getFormIcon().addClass('icon-address-book');

            return nextRendered;
        });
    }

    protected createFormIcon(): FormIcon {
        const formIcon: FormIcon = super.createFormIcon();
        formIcon.addClass('icon-address-book');
        return formIcon;
    }

    createSteps(persistedItem: IdProvider): WizardStep[] {
        const steps: WizardStep[] = [];

        this.idProviderWizardStepForm = new IdProviderWizardStepForm();
        this.idProviderWizardStepForm.initialize();

        this.permissionsWizardStepForm = new SecurityWizardStepForm();
        this.permissionsWizardStepForm.initialize();

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

    doLayout(persistedIdProvider: IdProvider): Q.Promise<void> {
        return super.doLayout(persistedIdProvider).then(() => {

            if (this.isRendered()) {
                return Q<void>(null);
            } else {
                return this.doLayoutPersistedItem(persistedIdProvider ? persistedIdProvider.clone() : null);
            }

        });
    }

    persistNewItem(): Q.Promise<IdProvider> {
        this.lock();
        return this.produceCreateIdProviderRequest().sendAndParse().then((idProvider: IdProvider) => {
            showFeedback('Id provider was created');
            new UserItemCreatedEvent(null, idProvider).fire();

            this.notifyUserItemNamed(idProvider);

            return idProvider;
        }).finally(this.unlock.bind(this));
    }

    postPersistNewItem(idProvider: IdProvider): Q.Promise<IdProvider> {
        Router.setHash('edit/' + idProvider.getKey());

        return Q(idProvider);
    }

    updatePersistedItem(): Q.Promise<IdProvider> {
        this.lock();
        return this.produceUpdateIdProviderRequest(this.assembleViewedIdProvider()).sendAndParse().then((idProvider: IdProvider) => {
            showFeedback('Id provider was updated');
            new UserItemUpdatedEvent(null, idProvider).fire();

            return idProvider;
        }).finally(this.unlock.bind(this));
    }

    saveChanges(): Q.Promise<IdProvider> {
        if (this.isRendered()) {
            if (!this.idProviderWizardStepForm.isValid()) {
                return Q.fcall(() => {
                    throw Error(i18n('notify.invalid.idProviderConfig'));
                });
            }
        }
        return super.saveChanges();
    }

    isNewChanged(): boolean {
        const wizardHeader: WizardHeaderWithDisplayNameAndName = this.getWizardHeader();
        const idProviderConfig: IdProviderConfig = this.idProviderWizardStepForm.getIdProviderConfig();
        return wizardHeader.getName() !== '' ||
               wizardHeader.getDisplayName() !== '' ||
               !ObjectHelper.stringEquals(this.idProviderWizardStepForm.getDescription(), this.defaultIdProvider.getDescription()) ||
               !(!idProviderConfig || idProviderConfig.equals(this.defaultIdProvider.getIdProviderConfig())) ||
               !this.permissionsWizardStepForm.getPermissions().equals(this.defaultIdProvider.getPermissions());
    }

    isPersistedEqualsViewed(): boolean {
        const viewedPrincipal: IdProvider = this.assembleViewedIdProvider();
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
            this.getWizardHeader().setName(this.getWizardNameValue());
            this.idProviderWizardStepForm.layout(persistedItem);
            this.permissionsWizardStepForm.layout(persistedItem, this.defaultIdProvider);
        } else {
            this.idProviderWizardStepForm.layout(this.defaultIdProvider);
            this.permissionsWizardStepForm.layoutReadOnly(this.defaultIdProvider);
        }

        return Q<void>(null);
    }

    protected updateHash(): void {
        if (this.getPersistedItem()) {
            Router.setHash('edit/' + this.getPersistedItem().getKey());
        } else {
            Router.setHash('new/');
        }
    }

    private assembleViewedIdProvider(): IdProvider {
        return new IdProviderBuilder()
            .setIdProviderConfig(this.idProviderWizardStepForm.getIdProviderConfig())
            .setPermissions(this.permissionsWizardStepForm.getPermissions())
            .setKey(this.getPersistedItem().getKey().toString())
            .setDisplayName(this.getWizardHeader().getDisplayName())
            .setDescription(this.idProviderWizardStepForm.getDescription())
            .build();
    }

    private listenToUserItemEvents() {
        const principalCreatedHandler = (event: UserItemCreatedEvent) => {
            if (!this.getPersistedItem()) { // skip if id provider is not persisted yet
                return;
            }

            const principal: Principal = event.getPrincipal();
            const isCreatedInCurrentIdProvider: boolean = !!principal && (principal.isUser() || principal.isGroup())
                                               && event.getIdProvider().getKey().equals(this.getPersistedItem().getKey());

            if (isCreatedInCurrentIdProvider) {
                this.wizardActions.getDeleteAction().setEnabled(false);
            }
        };

        const principalDeletedHandler = (event: UserItemDeletedEvent) => {
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
        const wizardHeader: WizardHeaderWithDisplayNameAndName = this.getWizardHeader();
        wizardHeader.normalizeNames();
        const key: IdProviderKey = new IdProviderKey(wizardHeader.getName());
        const name: string = wizardHeader.getDisplayName();
        const description: string = this.idProviderWizardStepForm.getDescription();
        const idProviderConfig: IdProviderConfig = this.idProviderWizardStepForm.getIdProviderConfig();
        const permissions: IdProviderAccessControlList = this.permissionsWizardStepForm.getPermissions();

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
            }).catch(DefaultErrorHandler.handle).done();
        }
    }

    private produceUpdateIdProviderRequest(viewedIdProvider: IdProvider): UpdateIdProviderRequest {
        const key: IdProviderKey = this.getPersistedItem().getKey();
        const name: string = viewedIdProvider.getDisplayName();
        const description: string = viewedIdProvider.getDescription();
        const idProviderConfig: IdProviderConfig = viewedIdProvider.getIdProviderConfig();
        const permissions: IdProviderAccessControlList = viewedIdProvider.getPermissions();

        return new UpdateIdProviderRequest()
            .setKey(key)
            .setDisplayName(name)
            .setDescription(description)
            .setIdProviderConfig(idProviderConfig)
            .setPermissions(permissions);
    }

    protected handleServerUpdate(principal: Principal, idProvider: IdProvider): void {
        if (idProvider && this.getPersistedItem().getKey().equals(idProvider.getKey())) {
            this.setPersistedItem(idProvider);
            this.doLayoutPersistedItem(idProvider);
        }
    }

    protected handleSuccessfulDelete(results: DeleteUserItemResult[]): void {
        const keys: UserItemKey[] = results.filter(result => result.isDeleted()).map(result => result.getKey());
        const msg = keys.length === 1 ?
            i18n('notify.delete.idprovider.single', keys[0]) :
            i18n('notify.delete.idprovider.multiple', keys.length);

        this.close();
        showFeedback(msg);
        UserItemDeletedEvent.create().setIdProviders([this.getPersistedItem()]).build().fire();
    }

    protected produceDeleteRequest(): DeleteUserItemRequest {
        return new DeleteIdProviderRequest().setKeys([this.getPersistedItem().getKey()]);
    }

}
