import Q from 'q';
import {UserItemWizardActions} from './action/UserItemWizardActions';
import {UserItemWizardPanelParams} from './UserItemWizardPanelParams';
import {PrincipalServerEventsHandler} from '../event/PrincipalServerEventsHandler';
import {ResponsiveManager} from '@enonic/lib-admin-ui/ui/responsive/ResponsiveManager';
import {ResponsiveItem} from '@enonic/lib-admin-ui/ui/responsive/ResponsiveItem';
import {FormIcon} from '@enonic/lib-admin-ui/app/wizard/FormIcon';
import {WizardHeaderWithDisplayNameAndName} from '@enonic/lib-admin-ui/app/wizard/WizardHeaderWithDisplayNameAndName';
import {WizardStep} from '@enonic/lib-admin-ui/app/wizard/WizardStep';
import {Toolbar, ToolbarConfig} from '@enonic/lib-admin-ui/ui/toolbar/Toolbar';
import {UserItem} from '@enonic/lib-admin-ui/security/UserItem';
import {WizardPanel} from '@enonic/lib-admin-ui/app/wizard/WizardPanel';
import {ImgEl} from '@enonic/lib-admin-ui/dom/ImgEl';
import {ElementShownEvent} from '@enonic/lib-admin-ui/dom/ElementShownEvent';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {ConfirmationDialog} from '@enonic/lib-admin-ui/ui/dialog/ConfirmationDialog';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {DeleteUserItemRequest} from '../../graphql/useritem/DeleteUserItemRequest';
import {DeleteUserItemResult} from '../../graphql/useritem/DeleteUserItemResult';
import {IdProvider} from '../principal/IdProvider';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {UserItemNamedEvent} from '../event/UserItemNamedEvent';

export abstract class UserItemWizardPanel<USER_ITEM_TYPE extends UserItem>
    extends WizardPanel<USER_ITEM_TYPE> {

    protected wizardActions: UserItemWizardActions<USER_ITEM_TYPE>;

    protected params: UserItemWizardPanelParams<USER_ITEM_TYPE>;

    private locked: boolean;

    private lockChangedListeners: ((value: boolean) => void)[];

    private userItemNamedListeners: ((event: UserItemNamedEvent) => void)[];

    protected constructor(params: UserItemWizardPanelParams<USER_ITEM_TYPE>) {
        super(params);

        this.lockChangedListeners = [];
        this.userItemNamedListeners = [];

        this.initListeners();
    }

    protected initListeners() {
        this.onWizardHeaderCreated(() => {
            this.getWizardHeader().setAutoTrim(true);
        });

        this.loadData();

        this.onValidityChanged(() => {
            this.wizardActions.getSaveAction().setEnabled(this.isValid());
        });

        this.onShown(() => {
            if (this.locked) {
                this.lock();
            }
        });

        this.wizardActions.getDeleteAction().onExecuted(this.handleDelete.bind(this));

        this.handleServerEvents();
    }

    protected getParams(): UserItemWizardPanelParams<USER_ITEM_TYPE> {
        return this.params;
    }

    protected createWizardActions(): UserItemWizardActions<USER_ITEM_TYPE> {
        return new UserItemWizardActions(this);
    }

    protected createMainToolbar(): Toolbar<ToolbarConfig> {
        const toolbar: Toolbar<ToolbarConfig> = new Toolbar<ToolbarConfig>();

        toolbar.addActions([this.wizardActions.getSaveAction(), this.wizardActions.getDeleteAction()]);

        return toolbar;
    }

    protected getWizardNameValue(): string {
        return this.getPersistedItem()?.getKey()?.getId() ?? '';
    }

    protected createWizardHeader(): WizardHeaderWithDisplayNameAndName {
        const wizardHeader: WizardHeaderWithDisplayNameAndName = new WizardHeaderWithDisplayNameAndName();
        const existing: USER_ITEM_TYPE = this.getPersistedItem();
        const name: string = this.getWizardNameValue();

        let displayName: string = '';

        if (existing) {
            displayName = existing.getDisplayName();

            wizardHeader.toggleNameInput(false);
            wizardHeader.setAutoGenerationEnabled(false);
        }

        wizardHeader.setPath(this.getParams().persistedPath);
        wizardHeader.setDisplayName(displayName);
        wizardHeader.setName(name);

        return wizardHeader;
    }

    public getWizardHeader(): WizardHeaderWithDisplayNameAndName {
        return super.getWizardHeader() as WizardHeaderWithDisplayNameAndName;
    }

    isInternalUserItem(): boolean {
        return this.getParams().isInternalKey();
    }

    isSystemUserItem(): boolean {
        return this.getParams().isSystemKey();
    }

    protected createFormIcon(): FormIcon {
        let iconUrl = ImgEl.PLACEHOLDER;
        let formIcon = new FormIcon(iconUrl, 'icon');
        formIcon.addClass('icon icon-xlarge');

        if (this.isInternalUserItem()) {
            formIcon.addClass('icon-system');
        }
        return formIcon;
    }

    public getFormIcon(): FormIcon {
        return super.getFormIcon() as FormIcon;
    }

    doRenderOnDataLoaded(rendered: boolean): Q.Promise<boolean> {
        return super.doRenderOnDataLoaded(rendered).then((nextRendered) => {
            this.addClass('principal-wizard-panel');

            const responsiveItem = ResponsiveManager.onAvailableSizeChanged(this, (item: ResponsiveItem) => {
                if (this.isVisible()) {
                    this.updateStickyToolbar();
                }
            });

            this.updateHash();
            this.onRemoved((event) => ResponsiveManager.unAvailableSizeChanged(this));

            this.onShown((event: ElementShownEvent) => {
                this.updateHash();
                responsiveItem.update();
            });

            return nextRendered;
        });
    }

    private handleServerEvents() {
        const deleteHandler = (ids: string[]) => {
            const id: string = this.isDataLoaded() ? this.getPersistedItem()?.getKey().toString() : this.params.tabId.getId();

            if (!!id && ids.indexOf(id) >= 0) {
                this.close();
            }
        };

        const handler = PrincipalServerEventsHandler.getInstance();
        handler.onUserItemDeleted(deleteHandler);

        const updateHandler = (principal: Principal, idProvider: IdProvider) => {
            if (!this.isItemPersisted() || !this.isDataLoaded()) {
                return;
            }

            this.handleServerUpdate(principal, idProvider);
        };

        handler.onUserItemUpdated(updateHandler);

        this.onRemoved(() => {
            handler.unUserItemDeleted(deleteHandler);
            handler.unUserItemUpdated(updateHandler);
        });
    }

    protected handleServerUpdate(principal: Principal, idProvider: IdProvider) {
        // TODO ?
    }

    protected getPersistedItemPath(): string {
        throw new Error('To be implemented by inheritors');
    }

    protected setPersistedItem(newPersistedItem: USER_ITEM_TYPE): void {
        super.setPersistedItem(newPersistedItem);

        if (this.wizardHeader) {
            (this.wizardHeader as WizardHeaderWithDisplayNameAndName).toggleNameInput(false);
        }
    }

    getUserItemType(): string {
        throw new Error('Must be implemented by inheritors');
    }

    getPersistedDisplayName(): string {
        return this.getParams().persistedDisplayName;
    }

    lock(): void {
        this.locked = true;
        this.formMask.show();
        this.notifyLockChanged(this.locked);
    }

    unlock(): void {
        this.locked = false;

        this.formMask.hide();
        this.notifyLockChanged(this.locked);
    }

    saveChanges(): Q.Promise<USER_ITEM_TYPE> {
        if (this.isRendered()) {
            this.getWizardHeader().normalizeNames();
            if (!this.getWizardHeader().getName()) {
                return Q.fcall(() => {
                    throw Error(i18n('notify.empty.name'));
                });
            }
            if (!this.getWizardHeader().getDisplayName()) {
                return Q.fcall(() => {
                    throw Error(i18n('notify.empty.displayName'));
                });
            }
        }
        return super.saveChanges();
    }

    close(checkCanClose: boolean = false): void {
        if (!checkCanClose || this.canClose()) {
            super.close(checkCanClose);
        }
    }

    canClose(): boolean {
        if (this.hasUnsavedChanges()) {
            this.openSaveBeforeCloseDialog();
            return false;
        } else {
            return true;
        }
    }

    private openSaveBeforeCloseDialog() {
        new ConfirmationDialog()
            .setQuestion(i18n('dialog.confirm.unsavedChanges'))
            .setYesCallback(this.saveAndClose.bind(this))
            .setNoCallback(this.close.bind(this))
            .open();
    }

    private saveAndClose() {
        this.saveChanges().then(() => {
            this.close();
        }).catch(DefaultErrorHandler.handle);
    }

    hasUnsavedChanges(): boolean {
        if (!this.isRendered()) {
            return false;
        }
        const persisted = this.getPersistedItem();
        if (persisted) {
            return !this.isPersistedEqualsViewed();
        }
        return this.isNewChanged();
    }

    createSteps(persistedItem: USER_ITEM_TYPE): WizardStep[] {
        throw new Error('Must be implemented by inheritors');
    }

    doLayout(persistedItem: USER_ITEM_TYPE): Q.Promise<void> {

        this.setSteps(this.createSteps(this.getPersistedItem()));

        return Q<void>(null);
    }

    protected doLayoutPersistedItem(persistedItem: USER_ITEM_TYPE): Q.Promise<void> {
        throw new Error('Must be implemented by inheritors');
    }

    persistNewItem(): Q.Promise<USER_ITEM_TYPE> {
        throw new Error('Must be implemented by inheritors');
    }

    updatePersistedItem(): Q.Promise<USER_ITEM_TYPE> {
        throw new Error('Must be implemented by inheritors');
    }

    getCloseAction(): Action {
        return this.wizardActions.getCloseAction();
    }

    protected updateHash(): void {
        throw new Error('Must be implemented by inheritors');
    }

    isPersistedEqualsViewed(): boolean {
        throw new Error('Must be implemented by inheritors');
    }

    isNewChanged(): boolean {
        throw new Error('Must be implemented by inheritors');
    }

    protected handleDelete(): void {
        new ConfirmationDialog()
            .setQuestion(i18n('dialog.delete.question'))
            .setNoCallback(null)
            .setYesCallback(() => {
                if (!this.isItemPersisted()) {
                    return;
                }

                this.produceDeleteRequest()
                    .sendAndParse()
                    .done((results: DeleteUserItemResult[]) => {
                        this.handleDeletedResult(results);
                    });

            }).open();
    }

    protected abstract produceDeleteRequest(): DeleteUserItemRequest;

    protected handleDeletedResult(results: DeleteUserItemResult[]): void {
        if (!results || results.length === 0) {
            return;
        }

        if (results[0].isDeleted()) {
            this.handleSuccessfulDelete(results);

            return;
        }

        if (results[0].getReason()) {
            DefaultErrorHandler.handle(results[0].getReason());
        }
    }

    protected abstract handleSuccessfulDelete(results: DeleteUserItemResult[]);

    onLockChanged(listener: (value: boolean) => void): void {
        this.lockChangedListeners.push(listener);
    }

    unLockChanged(listener: (value: boolean) => void): void {
        this.lockChangedListeners = this.lockChangedListeners.filter((curr: (value: boolean) => void) => {
            return listener !== curr;
        });
    }

    private notifyLockChanged(value: boolean) {
        this.lockChangedListeners.forEach((listener: (value: boolean) => void) => {
            listener(value);
        });
    }

    onUserItemNamed(listener: (event: UserItemNamedEvent) => void): void {
        this.userItemNamedListeners.push(listener);
    }

    protected notifyUserItemNamed(userItem: UserItem): void {
        this.userItemNamedListeners.forEach((listener: (event: UserItemNamedEvent) => void) => {
            listener.call(this, new UserItemNamedEvent(this, userItem));
        });
    }
}
