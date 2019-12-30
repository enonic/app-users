import {UserItem} from 'lib-admin-ui/security/UserItem';
import {IdProviderKey} from 'lib-admin-ui/security/IdProviderKey';
import {AppBarTabId} from 'lib-admin-ui/app/bar/AppBarTabId';

export class UserItemWizardPanelParams<USER_ITEM_TYPE extends UserItem> {

    tabId: AppBarTabId;

    idProviderKey: IdProviderKey;

    persistedPath: string;

    persistedDisplayName: string;

    persistedItem: USER_ITEM_TYPE;

    setPersistedPath(value: string): UserItemWizardPanelParams<USER_ITEM_TYPE> {
        this.persistedPath = value;
        return this;
    }

    setPersistedItem(value: USER_ITEM_TYPE): UserItemWizardPanelParams<USER_ITEM_TYPE> {
        this.persistedItem = value;
        return this;
    }

    setIdProviderKey(value: IdProviderKey): UserItemWizardPanelParams<USER_ITEM_TYPE> {
        this.idProviderKey = value;
        return this;
    }

    setTabId(value: AppBarTabId): UserItemWizardPanelParams<USER_ITEM_TYPE> {
        this.tabId = value;
        return this;
    }

    setPersistedDisplayName(value: string): UserItemWizardPanelParams<USER_ITEM_TYPE> {
        this.persistedDisplayName = value;
        return this;
    }

    isSystemKey(): boolean {
        return !!this.idProviderKey && this.idProviderKey.isSystem();
    }
}
