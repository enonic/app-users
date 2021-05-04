import * as Q from 'q';
import {UserTreeGridItem, UserTreeGridItemBuilder, UserTreeGridItemType} from './browse/UserTreeGridItem';
import {UserItemWizardPanel} from './wizard/UserItemWizardPanel';
import {IdProviderWizardPanel} from './wizard/IdProviderWizardPanel';
import {PrincipalWizardPanel} from './wizard/PrincipalWizardPanel';
import {NewPrincipalEvent} from './browse/NewPrincipalEvent';
import {EditPrincipalEvent} from './browse/EditPrincipalEvent';
import {UserBrowsePanel} from './browse/UserBrowsePanel';
import {IdProviderWizardPanelParams} from './wizard/IdProviderWizardPanelParams';
import {PrincipalWizardPanelParams} from './wizard/PrincipalWizardPanelParams';
import {RoleWizardPanel} from './wizard/RoleWizardPanel';
import {UserWizardPanel} from './wizard/UserWizardPanel';
import {GroupWizardPanel} from './wizard/GroupWizardPanel';
import {GetIdProviderByKeyRequest} from '../graphql/idprovider/GetIdProviderByKeyRequest';
import {GetPrincipalByKeyRequest} from '../graphql/principal/GetPrincipalByKeyRequest';
import {PrincipalNamedEvent} from './event/PrincipalNamedEvent';
import {IdProvider} from './principal/IdProvider';
import {NavigatedAppPanel} from 'lib-admin-ui/app/NavigatedAppPanel';
import {AppBarTabMenuItem, AppBarTabMenuItemBuilder} from 'lib-admin-ui/app/bar/AppBarTabMenuItem';
import {AppBarTabId} from 'lib-admin-ui/app/bar/AppBarTabId';
import {Principal} from 'lib-admin-ui/security/Principal';
import {PrincipalType} from 'lib-admin-ui/security/PrincipalType';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {UserItem} from 'lib-admin-ui/security/UserItem';
import {IdProviderKey} from 'lib-admin-ui/security/IdProviderKey';
import {LoadMask} from 'lib-admin-ui/ui/mask/LoadMask';
import {TabbedAppBar} from 'lib-admin-ui/app/bar/TabbedAppBar';
import {Path} from 'lib-admin-ui/rest/Path';
import {ShowBrowsePanelEvent} from 'lib-admin-ui/app/ShowBrowsePanelEvent';
import {PropertyChangedEvent} from 'lib-admin-ui/PropertyChangedEvent';
import {ValidityChangedEvent} from 'lib-admin-ui/ValidityChangedEvent';
import {WizardPanel} from 'lib-admin-ui/app/wizard/WizardPanel';
import {i18n} from 'lib-admin-ui/util/Messages';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {showError} from 'lib-admin-ui/notify/MessageBus';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {NamePrettyfier} from 'lib-admin-ui/NamePrettyfier';
import {IdProviderMode} from 'lib-admin-ui/security/IdProviderMode';
import {Event} from 'lib-admin-ui/event/Event';

interface PrincipalData {

    tabName: string;

    principalPath: string;

    principalType: PrincipalType;
}

export class UserAppPanel
    extends NavigatedAppPanel {

    private mask: LoadMask;

    constructor(appBar: TabbedAppBar, path?: Path) {

        super(appBar);

        this.mask = new LoadMask(this);

        this.route(path);
    }

    private route(path?: Path) {
        const action = path ? path.getElement(0) : null;
        let id;

        switch (action) {
        case 'edit':
            id = path.getElement(1);
            if (id && this.isValidPrincipalKey(id)) {
                new GetPrincipalByKeyRequest(PrincipalKey.fromString(id)).sendAndParse().done(
                    (principal: Principal) => {
                        new EditPrincipalEvent([
                            new UserTreeGridItemBuilder().setPrincipal(principal).setType(UserTreeGridItemType.PRINCIPAL).build()
                        ]).fire();
                    });
            } else if (id && this.isValidIdProviderKey(id)) {
                new GetIdProviderByKeyRequest(IdProviderKey.fromString(id)).sendAndParse().done((idProvider: IdProvider) => {
                    new EditPrincipalEvent([
                        new UserTreeGridItemBuilder().setIdProvider(idProvider).setType(
                            UserTreeGridItemType.ID_PROVIDER).build()
                    ]).fire();
                });
            } else {
                new ShowBrowsePanelEvent().fire();
            }
            break;
        case 'view':
            id = path.getElement(1);
            break;
        default:
            new ShowBrowsePanelEvent().fire();
            break;
        }
    }

    private isValidPrincipalKey(value: string): boolean {
        try {
            PrincipalKey.fromString(value);
            return true;
        } catch (e) {
            return false;
        }
    }

    private isValidIdProviderKey(value: string): boolean {
        try {
            IdProviderKey.fromString(value);
            return true;
        } catch (e) {
            return false;
        }
    }

    addWizardPanel(tabMenuItem: AppBarTabMenuItem, wizardPanel: UserItemWizardPanel<any>) {
        super.addWizardPanel(tabMenuItem, wizardPanel);

        wizardPanel.onRendered(() => {
            tabMenuItem.setLabel(this.getWizardPanelItemDisplayName(wizardPanel));

            wizardPanel.getWizardHeader().onPropertyChanged((event: PropertyChangedEvent) => {
                if (event.getPropertyName() === 'displayName') {
                    let name = <string>event.getNewValue() || this.getPrettyNameForWizardPanel(wizardPanel);
                    tabMenuItem.setLabel(name, !<string>event.getNewValue());
                }
            });
        });

        //tabMenuItem.markInvalid(!wizardPanel.getPersistedItem().isValid());

        wizardPanel.onValidityChanged((event: ValidityChangedEvent) => {
            tabMenuItem.markInvalid(!wizardPanel.isValid());
        });

        wizardPanel.onLockChanged(value => {
            value ? tabMenuItem.lock() : tabMenuItem.unlock();
        });
    }

    protected handleGlobalEvents() {
        super.handleGlobalEvents();

        NewPrincipalEvent.on((event) => {
            this.handleNew(event);
        });

        EditPrincipalEvent.on((event) => {
            this.handleEdit(event);
        });
    }

    handleBrowse() {
        super.handleBrowse();

        this.getAppBarTabMenu().deselectNavigationItem();
    }

    protected createBrowsePanel(): UserBrowsePanel {
        return new UserBrowsePanel();
    }

    private handleWizardCreated(wizard: UserItemWizardPanel<UserItem>, tabName: string) {
        let tabMenuItem = new AppBarTabMenuItemBuilder()
            .setLabel(NamePrettyfier.prettifyUnnamed(tabName))
            .setTabId(wizard.getTabId())
            .setCloseAction(wizard.getCloseAction())
            .build();

        this.addWizardPanel(tabMenuItem, wizard);

    }

    private getWizardPanelItemDisplayName(wizardPanel: WizardPanel<UserItem>): string {
        let displayName;
        if (!!wizardPanel.getPersistedItem()) {
            displayName = (<any>wizardPanel.getPersistedItem()).getDisplayName();
        }

        return displayName || this.getPrettyNameForWizardPanel(wizardPanel);
    }

    private getPrettyNameForWizardPanel(wizard: WizardPanel<UserItem>): string {
        return NamePrettyfier.prettifyUnnamed((<UserItemWizardPanel<UserItem>>wizard).getUserItemType());
    }

    private handleWizardUpdated(wizard: UserItemWizardPanel<UserItem>, tabMenuItem: AppBarTabMenuItem) {

        if (tabMenuItem != null) {
            this.getAppBarTabMenu().deselectNavigationItem();
            this.getAppBarTabMenu().removeNavigationItem(tabMenuItem);
            this.removePanelByIndex(tabMenuItem.getIndex());
        }
        tabMenuItem =
            new AppBarTabMenuItemBuilder().setTabId(wizard.getTabId()).setEditing(true).setCloseAction(wizard.getCloseAction()).setLabel(
                wizard.getPersistedDisplayName()).build();
        this.addWizardPanel(tabMenuItem, wizard);

        // TODO: what is this view that we try to remove?
        /*var viewTabId = AppBarTabId.forView(id);
         var viewTabMenuItem = this.getAppBarTabMenu().getNavigationItemById(viewTabId);
         if (viewTabMenuItem != null) {
         this.removePanelByIndex(viewTabMenuItem.getIndex());
         }*/
    }

    private handleNew(event: NewPrincipalEvent) {
        let userItem = event.getPrincipals()[0];
        let data: PrincipalData = this.resolvePrincipalData(userItem);
        let tabId = AppBarTabId.forNew(data.principalPath);
        let tabMenuItem = this.getAppBarTabMenu().getNavigationItemById(tabId);

        if (tabMenuItem != null) {
            this.selectPanel(tabMenuItem);
        } else {
            if (!userItem || userItem.getType() === UserTreeGridItemType.ID_PROVIDER) {
                this.handleIdProviderNew(tabId, data.tabName);
            } else {
                this.loadIdProviderIfNeeded(userItem).then((idProvider: IdProvider) => {
                    this.handlePrincipalNew(tabId, data, idProvider, userItem);
                });
            }
        }

    }

    private resolvePrincipalData(userItem: UserTreeGridItem): PrincipalData {
        let principalType: PrincipalType;
        let principalPath = '';
        let tabName;

        if (userItem) {
            switch (userItem.getType()) {

            case UserTreeGridItemType.USERS:
                principalType = PrincipalType.USER;
                principalPath = PrincipalKey.ofUser(userItem.getIdProvider().getKey(), 'none').toPath(true);
                tabName = i18n('field.user');
                break;
            case UserTreeGridItemType.GROUPS:
                principalType = PrincipalType.GROUP;
                principalPath = PrincipalKey.ofGroup(userItem.getIdProvider().getKey(), 'none').toPath(true);
                tabName = i18n('field.group');
                break;
            case UserTreeGridItemType.ROLES:
                principalType = PrincipalType.ROLE;
                principalPath = PrincipalKey.ofRole('none').toPath(true);
                tabName = i18n('field.role');
                break;
            case UserTreeGridItemType.PRINCIPAL:
                principalType = userItem.getPrincipal().getType();
                principalPath = userItem.getPrincipal().getKey().toPath(true);
                tabName = i18n(`field.${PrincipalType[principalType].toLowerCase()}`);
                break;
            case UserTreeGridItemType.ID_PROVIDER:
                tabName = i18n('field.idProvider');
                break;
            }

        } else {
            tabName = i18n('field.idProvider');
        }

        return {
            tabName,
            principalType,
            principalPath
        };
    }

    private loadIdProviderIfNeeded(userItem: UserTreeGridItem) {
        let promise;
        this.mask.show();

        switch (userItem.getType()) {
        case UserTreeGridItemType.USERS:
        case UserTreeGridItemType.GROUPS:
            promise = new GetIdProviderByKeyRequest(userItem.getIdProvider().getKey()).sendAndParse();
            break;
        case UserTreeGridItemType.PRINCIPAL:
            // Roles does not have a IdProvider link
            if (userItem.getPrincipal().getType() !== PrincipalType.ROLE) {
                promise = new GetIdProviderByKeyRequest(userItem.getPrincipal().getKey().getIdProvider()).sendAndParse();
            } else {
                promise = Q(userItem.getIdProvider());
            }
            break;
        default:
        case UserTreeGridItemType.ID_PROVIDER:
        case UserTreeGridItemType.ROLES:
            promise = Q(userItem.getIdProvider());
            break;
        }

        return promise
            .catch((reason: any) => {
                DefaultErrorHandler.handle(reason);
            }).finally(() => {
                this.mask.hide();
            });
    }

    private handlePrincipalNew(tabId: AppBarTabId, data: PrincipalData, idProvider: IdProvider, userItem: UserTreeGridItem) {
        if (data.principalType === PrincipalType.USER && !this.areUsersEditable(idProvider)) {
            showError(i18n('notify.invalid.application', i18n('action.create').toLowerCase(),
                i18n('field.users').toLowerCase()));
            return;
        }
        if (data.principalType === PrincipalType.GROUP && !this.areGroupsEditable(idProvider)) {
            showError(i18n('notify.invalid.application', i18n('action.create').toLowerCase(),
                i18n('field.groups').toLowerCase()));
            return;
        }

        let wizardParams = <PrincipalWizardPanelParams> new PrincipalWizardPanelParams()
            .setIdProvider(idProvider)
            .setParentOfSameType(userItem.getType() === UserTreeGridItemType.PRINCIPAL)
            .setPersistedType(data.principalType)
            .setPersistedPath(data.principalPath)
            .setTabId(tabId);

        let wizard = this.resolvePrincipalWizardPanel(wizardParams);

        wizard.onPrincipalNamed((event: PrincipalNamedEvent) => {
            this.handlePrincipalNamedEvent(event);
        });

        this.handleWizardCreated(wizard, data.tabName);
    }

    private handleIdProviderNew(tabId: AppBarTabId, tabName: string) {
        let wizardParams = <IdProviderWizardPanelParams> new IdProviderWizardPanelParams().setTabId(tabId);
        this.handleWizardCreated(new IdProviderWizardPanel(wizardParams), tabName);
    }

    private handleEdit(event: EditPrincipalEvent) {
        let userItems: UserTreeGridItem[] = event.getPrincipals();

        userItems.forEach((userItem: UserTreeGridItem) => {
            if (!userItem) {
                return;
            }

            let tabMenuItem = this.resolveTabMenuItem(userItem);

            if (tabMenuItem != null) {
                this.selectPanel(tabMenuItem);
            } else {
                let tabId = this.getTabIdForUserItem(userItem);
                if (userItem.getType() === UserTreeGridItemType.ID_PROVIDER) {
                    this.handleIdProviderEdit(userItem.getIdProvider(), tabId, tabMenuItem);
                } else if (userItem.getType() === UserTreeGridItemType.PRINCIPAL) {
                    this.loadIdProviderIfNeeded(userItem).then((idProvider) => {
                        this.handlePrincipalEdit(userItem.getPrincipal(), idProvider, tabId, tabMenuItem);
                    });
                }
            }
        });
    }

    private handleIdProviderEdit(idProvider: IdProvider, tabId: AppBarTabId, tabMenuItem: AppBarTabMenuItem) {

        let wizardParams = new IdProviderWizardPanelParams()
            .setIdProviderKey(idProvider.getKey()) // use key to load persisted item
            .setTabId(tabId)
            .setPersistedDisplayName(idProvider.getDisplayName());

        let wizard = new IdProviderWizardPanel(wizardParams);

        this.handleWizardUpdated(wizard, tabMenuItem);
    }

    private handlePrincipalEdit(principal: Principal, idProvider: IdProvider, tabId: AppBarTabId, tabMenuItem: AppBarTabMenuItem) {

        let principalType = principal.getType();

        if (PrincipalType.USER === principalType && !this.areUsersEditable(idProvider)) {
            showError(i18n('notify.invalid.application', i18n('action.edit').toLowerCase(), i18n('field.users').toLowerCase()));
            return;

        } else if (PrincipalType.GROUP === principalType && !this.areGroupsEditable(idProvider)) {
            showError(i18n('notify.invalid.application', i18n('action.edit').toLowerCase(), i18n('field.groups').toLowerCase()));
            return;

        } else {
            this.createPrincipalWizardPanelForEdit(principal, idProvider, tabId, tabMenuItem);

        }
    }

    private createPrincipalWizardPanelForEdit(principal: Principal, idProvider: IdProvider, tabId: AppBarTabId,
                                              tabMenuItem: AppBarTabMenuItem) {

        let wizardParams = <PrincipalWizardPanelParams> new PrincipalWizardPanelParams()
            .setIdProvider(idProvider)
            .setPrincipalKey(principal.getKey()) // user principal key to load persisted item
            .setPersistedType(principal.getType())
            .setPersistedPath(principal.getKey().toPath(true))
            .setTabId(tabId)
            .setPersistedDisplayName(principal.getDisplayName());

        let wizard = this.resolvePrincipalWizardPanel(wizardParams);

        this.handleWizardUpdated(wizard, tabMenuItem);
    }

    private resolvePrincipalWizardPanel(wizardParams: PrincipalWizardPanelParams): PrincipalWizardPanel {
        let wizard: PrincipalWizardPanel;
        switch (wizardParams.persistedType) {
        case PrincipalType.ROLE:
            wizard = new RoleWizardPanel(wizardParams);
            break;
        case PrincipalType.USER:
            wizard = new UserWizardPanel(wizardParams);
            break;
        case PrincipalType.GROUP:
            wizard = new GroupWizardPanel(wizardParams);
            break;
        default:
            wizard = new PrincipalWizardPanel(wizardParams);
        }
        return wizard;
    }

    private handlePrincipalNamedEvent(event: Event) {
        let e = <PrincipalNamedEvent>event;
        let wizard = e.getWizard();
        let tabMenuItem = this.getAppBarTabMenu().getNavigationItemById(wizard.getTabId());
        // update tab id so that new wizard for the same content type can be created
        let newTabId = AppBarTabId.forEdit(e.getPrincipal().getKey().toString());
        tabMenuItem.setTabId(newTabId);
        wizard.setTabId(newTabId);

        let name = e.getPrincipal().getDisplayName();
        if (ObjectHelper.iFrameSafeInstanceOf(wizard, PrincipalWizardPanel)) {
            name = name || this.getPrettyNameForWizardPanel(wizard);
        }
        this.getAppBarTabMenu().getNavigationItemById(newTabId).setLabel(name, !e.getPrincipal().getDisplayName());
    }

    private resolveTabMenuItem(userItem: UserTreeGridItem): AppBarTabMenuItem {
        if (!!userItem) {
            return this.getAppBarTabMenu().getNavigationItemById(this.getTabIdForUserItem(userItem));
        }
        return null;
    }

    private getTabIdForUserItem(userItem: UserTreeGridItem): AppBarTabId {
        let appBarTabId: AppBarTabId;
        if (UserTreeGridItemType.PRINCIPAL === userItem.getType()) {
            appBarTabId = AppBarTabId.forEdit(userItem.getPrincipal().getKey().toString());
        } else if (UserTreeGridItemType.ID_PROVIDER === userItem.getType()) {
            appBarTabId = AppBarTabId.forEdit(userItem.getIdProvider().getKey().toString());
        }
        return appBarTabId;
    }

    private areUsersEditable(idProvider: IdProvider): boolean {
        let idProviderMode = idProvider.getIdProviderMode();
        return IdProviderMode.EXTERNAL !== idProviderMode && IdProviderMode.MIXED !== idProviderMode;
    }

    private areGroupsEditable(idProvider: IdProvider): boolean {
        let idProviderMode = idProvider.getIdProviderMode();
        return IdProviderMode.EXTERNAL !== idProviderMode;
    }

}
