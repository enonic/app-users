import UserItem = api.security.UserItem;
import UserStoreKey = api.security.UserStoreKey;

export class UserItemWizardPanelParams<USER_ITEM_TYPE extends UserItem> {

    tabId: api.app.bar.AppBarTabId;

    userStoreKey: UserStoreKey;

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

    setUserStoreKey(value: UserStoreKey): UserItemWizardPanelParams<USER_ITEM_TYPE> {
        this.userStoreKey = value;
        return this;
    }

    setTabId(value: api.app.bar.AppBarTabId): UserItemWizardPanelParams<USER_ITEM_TYPE> {
        this.tabId = value;
        return this;
    }

    setPersistedDisplayName(value: string): UserItemWizardPanelParams<USER_ITEM_TYPE> {
        this.persistedDisplayName = value;
        return this;
    }

    isSystemKey(): boolean {
        return !!this.userStoreKey && this.userStoreKey.isSystem();
    }
}
