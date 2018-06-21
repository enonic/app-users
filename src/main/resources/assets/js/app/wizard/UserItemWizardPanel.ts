import '../../api.ts';
import {UserItemWizardActions} from './action/UserItemWizardActions';
import {UserItemWizardPanelParams} from './UserItemWizardPanelParams';
import {SaveBeforeCloseDialog} from './SaveBeforeCloseDialog';
import {PrincipalServerEventsHandler} from '../event/PrincipalServerEventsHandler';
import ResponsiveManager = api.ui.responsive.ResponsiveManager;
import ResponsiveItem = api.ui.responsive.ResponsiveItem;
import FormIcon = api.app.wizard.FormIcon;
import WizardHeaderWithDisplayNameAndName = api.app.wizard.WizardHeaderWithDisplayNameAndName;
import WizardHeaderWithDisplayNameAndNameBuilder = api.app.wizard.WizardHeaderWithDisplayNameAndNameBuilder;
import WizardStep = api.app.wizard.WizardStep;
import Toolbar = api.ui.toolbar.Toolbar;
import UserItem = api.security.UserItem;
import i18n = api.util.i18n;

export class UserItemWizardPanel<USER_ITEM_TYPE extends UserItem>
    extends api.app.wizard.WizardPanel<USER_ITEM_TYPE> {

    protected wizardActions: UserItemWizardActions<USER_ITEM_TYPE>;

    protected params: UserItemWizardPanelParams<USER_ITEM_TYPE>;

    constructor(params: UserItemWizardPanelParams<USER_ITEM_TYPE>) {

        super(params);

        this.onWizardHeaderCreated(() => {
            this.getWizardHeader().setAutoTrim(true);
        });

        this.loadData();

        this.onValidityChanged(() => {
            this.wizardActions.getSaveAction().setEnabled(this.isValid());
        });

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
        let iconUrl = api.dom.ImgEl.PLACEHOLDER;
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

            this.onShown((event: api.dom.ElementShownEvent) => {
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

    saveChanges(): wemQ.Promise<USER_ITEM_TYPE> {
        if (this.isRendered()) {
            this.getWizardHeader().normalizeNames();
            if (!this.getWizardHeader().getName()) {
                return wemQ.fcall(() => {
                    throw i18n('notify.empty.name');
                });
            }
            if (!this.getWizardHeader().getDisplayName()) {
                return wemQ.fcall(() => {
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

    doLayout(persistedItem: USER_ITEM_TYPE): wemQ.Promise<void> {

        this.setSteps(this.createSteps(this.getPersistedItem()));

        return wemQ<void>(null);
    }

    protected doLayoutPersistedItem(persistedItem: USER_ITEM_TYPE): Q.Promise<void> {
        throw new Error('Must be implemented by inheritors');
    }

    persistNewItem(): wemQ.Promise<USER_ITEM_TYPE> {
        throw new Error('Must be implemented by inheritors');
    }

    updatePersistedItem(): wemQ.Promise<USER_ITEM_TYPE> {
        throw new Error('Must be implemented by inheritors');
    }

    getCloseAction(): api.ui.Action {
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
}
