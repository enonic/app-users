import * as Q from 'q';
import {UserItemWizardActions} from './action/UserItemWizardActions';
import {UserItemWizardPanelParams} from './UserItemWizardPanelParams';
import {SaveBeforeCloseDialog} from './SaveBeforeCloseDialog';
import {PrincipalServerEventsHandler} from '../event/PrincipalServerEventsHandler';
import {ResponsiveManager} from 'lib-admin-ui/ui/responsive/ResponsiveManager';
import {ResponsiveItem} from 'lib-admin-ui/ui/responsive/ResponsiveItem';
import {FormIcon} from 'lib-admin-ui/app/wizard/FormIcon';
import {
    WizardHeaderWithDisplayNameAndName,
    WizardHeaderWithDisplayNameAndNameBuilder
} from 'lib-admin-ui/app/wizard/WizardHeaderWithDisplayNameAndName';
import {WizardStep} from 'lib-admin-ui/app/wizard/WizardStep';
import {Toolbar} from 'lib-admin-ui/ui/toolbar/Toolbar';
import {UserItem} from 'lib-admin-ui/security/UserItem';
import {WizardPanel} from 'lib-admin-ui/app/wizard/WizardPanel';
import {ImgEl} from 'lib-admin-ui/dom/ImgEl';
import {ElementShownEvent} from 'lib-admin-ui/dom/ElementShownEvent';
import {Error} from 'tslint/lib/error';
import {i18n} from 'lib-admin-ui/util/Messages';
import {Action} from 'lib-admin-ui/ui/Action';
import {ConfirmationDialog} from 'lib-admin-ui/ui/dialog/ConfirmationDialog';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {DeleteUserItemRequest} from '../../graphql/useritem/DeleteUserItemRequest';
import {DeleteUserItemResult} from '../../graphql/useritem/DeleteUserItemResult';

export abstract class UserItemWizardPanel<USER_ITEM_TYPE extends UserItem>
    extends WizardPanel<USER_ITEM_TYPE> {

    protected wizardActions: UserItemWizardActions<USER_ITEM_TYPE>;

    protected params: UserItemWizardPanelParams<USER_ITEM_TYPE>;

    private locked: boolean;

    private lockChangedListeners: { (value: boolean): void }[] = [];

    constructor(params: UserItemWizardPanelParams<USER_ITEM_TYPE>) {

        super(params);

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
    }

    protected getParams(): UserItemWizardPanelParams<USER_ITEM_TYPE> {
        return this.params;
    }

    protected createWizardActions(): UserItemWizardActions<USER_ITEM_TYPE> {
        return new UserItemWizardActions(this);
    }

    protected createMainToolbar(): Toolbar {
        const toolbar: Toolbar = new Toolbar();

        toolbar.addAction(this.wizardActions.getSaveAction());
        toolbar.addAction(this.wizardActions.getDeleteAction());

        return toolbar;
    }

    protected getWizardNameValue(): string {
        return this.getPersistedItem() ? this.getPersistedItem().getKey().getId() : '';
    }

    protected createWizardHeader(): WizardHeaderWithDisplayNameAndName {
        let wizardHeader = new WizardHeaderWithDisplayNameAndNameBuilder().build();

        const existing = this.getPersistedItem();
        const name = this.getWizardNameValue();

        let displayName = '';

        if (existing) {
            displayName = existing.getDisplayName();

            wizardHeader.disableNameInput();
            wizardHeader.setAutoGenerationEnabled(false);
        }

        wizardHeader.setPath(this.getParams().persistedPath);
        wizardHeader.initNames(displayName, name, false);

        return wizardHeader;
    }

    public getWizardHeader(): WizardHeaderWithDisplayNameAndName {
        return <WizardHeaderWithDisplayNameAndName> super.getWizardHeader();
    }

    isSystemUserItem(): boolean {
        return this.getParams().isSystemKey();
    }

    protected createFormIcon(): FormIcon {
        let iconUrl = ImgEl.PLACEHOLDER;
        let formIcon = new FormIcon(iconUrl, 'icon');
        formIcon.addClass('icon icon-xlarge');

        if (this.isSystemUserItem()) {
            formIcon.addClass('icon-system');
        }
        return formIcon;
    }

    public getFormIcon(): FormIcon {
        return <FormIcon> super.getFormIcon();
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

            const deleteHandler = ((ids: string[]) => {
                const item = this.getPersistedItem();
                if (!!item && ids.indexOf(item.getKey().toString()) >= 0) {
                    this.close();
                }
            });

            const handler = PrincipalServerEventsHandler.getInstance();
            handler.onUserItemDeleted(deleteHandler);

            this.onRemoved(() => {
                handler.unUserItemDeleted(deleteHandler);
            });

            return nextRendered;
        });
    }

    protected getPersistedItemPath(): string {
        throw new Error('To be implemented by inheritors');
    }

    protected setPersistedItem(newPersistedItem: USER_ITEM_TYPE): void {
        super.setPersistedItem(newPersistedItem);

        if (this.wizardHeader) {
            (<WizardHeaderWithDisplayNameAndName>this.wizardHeader).disableNameInput();
        }
    }

    getUserItemType(): string {
        throw new Error('Must be implemented by inheritors');
    }

    getPersistedDisplayName(): string {
        return this.getParams().persistedDisplayName;
    }

    lock() {
        this.locked = true;
        this.formMask.show();
        this.notifyLockChanged(this.locked);
    }

    unlock() {
        this.locked = false;

        this.formMask.hide();
        this.notifyLockChanged(this.locked);
    }

    saveChanges(): Q.Promise<USER_ITEM_TYPE> {
        if (this.isRendered()) {
            this.getWizardHeader().normalizeNames();
            if (!this.getWizardHeader().getName()) {
                return Q.fcall(() => {
                    throw i18n('notify.empty.name');
                });
            }
            if (!this.getWizardHeader().getDisplayName()) {
                return Q.fcall(() => {
                    throw i18n('notify.empty.displayName');
                });
            }
        }
        return super.saveChanges();
    }

    close(checkCanClose: boolean = false) {
        if (!checkCanClose || this.canClose()) {
            super.close(checkCanClose);
        }
    }

    canClose(): boolean {
        if (this.hasUnsavedChanges()) {
            new SaveBeforeCloseDialog(this).open();
            return false;
        } else {
            return true;
        }
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

    protected updateHash() {
        throw new Error('Must be implemented by inheritors');
    }

    isPersistedEqualsViewed(): boolean {
        throw new Error('Must be implemented by inheritors');
    }

    isNewChanged(): boolean {
        throw new Error('Must be implemented by inheritors');
    }

    protected handleDelete() {
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

    protected handleDeletedResult(results: DeleteUserItemResult[]) {
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

    onLockChanged(listener: (value: boolean) => void) {
        this.lockChangedListeners.push(listener);
    }

    unLockChanged(listener: (value: boolean) => void) {
        this.lockChangedListeners = this.lockChangedListeners.filter((curr: (value: boolean) => void) => {
            return listener !== curr;
        });
    }

    private notifyLockChanged(value: boolean) {
        this.lockChangedListeners.forEach((listener: (value: boolean) => void) => {
            listener(value);
        });
    }
}
