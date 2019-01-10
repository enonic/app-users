import NodeServerChangeType = api.event.NodeServerChangeType;
import Path = api.rest.Path;
import Principal = api.security.Principal;
import PrincipalServerEvent = api.security.event.PrincipalServerEvent;
import PrincipalServerChange = api.security.event.PrincipalServerChange;
import PrincipalServerChangeItem = api.security.event.PrincipalServerChangeItem;
import PrincipalKey = api.security.PrincipalKey;
import IdProviderKey = api.security.IdProviderKey;
import {GetIdProviderByKeyRequest} from '../../api/graphql/userStore/GetIdProviderByKeyRequest';
import {GetPrincipalByKeyRequest} from '../../api/graphql/principal/GetPrincipalByKeyRequest';
import {IdProvider} from '../principal/IdProvider';

/**
 * Class that listens to server events and fires UI events
 */
export class PrincipalServerEventsHandler {

    private static instance: PrincipalServerEventsHandler = new PrincipalServerEventsHandler();

    private handler: (event: PrincipalServerEvent) => void;

    private userItemCreatedListeners: { (principal: Principal, userStore: IdProvider, sameTypeParent?: boolean): void }[] = [];
    private userItemUpdatedListeners: { (principal: Principal, userStore: IdProvider): void }[] = [];
    private userItemDeletedListeners: { (ids: string[]): void }[] = [];

    private static debug: boolean = false;

    static getInstance(): PrincipalServerEventsHandler {
        return this.instance;
    }

    start() {
        if (!this.handler) {
            this.handler = this.principalServerEventHandler.bind(this);
        }
        PrincipalServerEvent.on(this.handler);
    }

    stop() {
        if (this.handler) {
            PrincipalServerEvent.un(this.handler);
            this.handler = null;
        }
    }

    private principalServerEventHandler(event: PrincipalServerEvent) {
        if (PrincipalServerEventsHandler.debug) {
            console.debug('PrincipalServerEventsHandler: received server event', event);
        }

        if (event.getType() === NodeServerChangeType.DELETE) {
            this.handleUserItemDeleted(this.extractPrincipalIds([event.getNodeChange()]));
        } else {
            // allow some time for the backend to process items before requesting them
            setTimeout(this.loadUserItems.bind(this, event), 1000);
        }
    }

    private isIgnoredItem(item: PrincipalServerChangeItem): boolean {
        const id = this.getId(item);
        if (!id) {
            return true;
        }
        const path = Path.fromString(item.getPath());
        const name = path.getElement(path.getElements().length - 1);

        if (name === 'groups' || name === 'users' || name === 'roles') {
            return true;
        }

        return false;
    }

    onUserItemCreated(listener: (principal: Principal, userStore: IdProvider, sameTypeParent?: boolean) => void) {
        this.userItemCreatedListeners.push(listener);
    }

    unUserItemCreated(listener: (principal: Principal, userStore: IdProvider, sameTypeParent?: boolean) => void) {
        this.userItemCreatedListeners =
            this.userItemCreatedListeners.filter(currentListener => {
                return currentListener !== listener;
            });
    }

    onUserItemUpdated(listener: (principal: Principal, userStore: IdProvider) => void) {
        this.userItemUpdatedListeners.push(listener);
    }

    unUserItemUpdated(listener: (principal: Principal, userStore: IdProvider) => void) {
        this.userItemUpdatedListeners =
            this.userItemUpdatedListeners.filter((currentListener: (principal: Principal, userStore: IdProvider) => void) => {
                return currentListener !== listener;
            });
    }

    private handleUserItemDeleted(ids: string[]) {
        if (PrincipalServerEventsHandler.debug) {
            console.debug('UserItemServerEventsHandler: deleted', ids);
        }

        this.notifyUserItemDeleted(ids);
    }

    private extractPrincipalIds(changes: PrincipalServerChange[]): string[] {
        return changes.reduce<string[]>((prev, curr) => {
            return prev.concat(curr.getChangeItems().map((changeItem: PrincipalServerChangeItem) => {
                return this.getId(changeItem);
            }));
        }, []);
    }

    /**
     * Get <name> for userStores, role:<name> for roles and ids otherwise
     * @param {api.security.event.PrincipalServerChangeItem} changeItem
     * @returns {string}
     */
    private getId(changeItem: PrincipalServerChangeItem): string {
        const path = Path.fromString(changeItem.getPath());
        const name = path.getElement(path.getElements().length - 1);
        if (path.hasParent()) {
            return path.getParentPath().toString() === '/roles' ? 'role:' + name : changeItem.getId();
        }

        return name;
    }

    private loadUserItems(event: PrincipalServerEvent) {
        event.getNodeChange().getChangeItems().forEach((item: PrincipalServerChangeItem) => {

            if (this.isIgnoredItem(item)) {
                return;
            }

            const path = Path.fromString(item.getPath());
            const id = this.getId(item);
            if (!path.hasParent()) {
                // it's a userStore
                new GetIdProviderByKeyRequest(IdProviderKey.fromString(id)).sendAndParse().then(idProvider => {
                    if (PrincipalServerEventsHandler.debug) {
                        console.debug('PrincipalServerEventsHandler.loaded idprovider:', idProvider);
                    }
                    if (idProvider) {
                        this.onUserItemLoaded(event, null, idProvider);
                    }
                }).catch(api.DefaultErrorHandler.handle);
            } else {
                // it's a principal, fetch him as well as userStore
                const key = PrincipalKey.fromString(id);
                if (key.isRole()) {
                    new GetPrincipalByKeyRequest(key).sendAndParse().then(principal => {
                        if (PrincipalServerEventsHandler.debug) {
                            console.debug('PrincipalServerEventsHandler.loaded principal:', principal);
                        }
                        this.onUserItemLoaded(event, principal, null);
                    }).catch(api.DefaultErrorHandler.handle);
                } else {
                    new GetPrincipalByKeyRequest(key).sendAndParse().then(principal => {
                        if (PrincipalServerEventsHandler.debug) {
                            console.debug('PrincipalServerEventsHandler.loaded principal:', principal);
                        }
                        if (principal) {
                            return new GetIdProviderByKeyRequest(principal.getKey().getIdProvider()).sendAndParse().then(userStore => {
                                this.onUserItemLoaded(event, principal, userStore);
                            });
                        }
                        console.warn('PrincipalServerEventsHandler: could not load principal[' + key.toString() + ']');
                    }).catch(api.DefaultErrorHandler.handle);
                }
            }
        });
    }

    private onUserItemLoaded(event: PrincipalServerEvent, principal: Principal, userStore: IdProvider) {
        switch (event.getType()) {
        case NodeServerChangeType.CREATE:
            this.handleUserItemCreated(principal, userStore);
            break;
        case NodeServerChangeType.UPDATE:
        case NodeServerChangeType.UPDATE_PERMISSIONS:
            this.handleUserItemUpdated(principal, userStore);
            break;
        }
    }

    private handleUserItemCreated(principal: Principal, userStore: IdProvider) {
        if (PrincipalServerEventsHandler.debug) {
            console.debug('UserItemServerEventsHandler: created', principal, userStore);
        }

        this.notifyUserItemCreated(principal, userStore, false);
    }

    private handleUserItemUpdated(principal: Principal, userStore: IdProvider) {
        if (PrincipalServerEventsHandler.debug) {
            console.debug('UserItemServerEventsHandler: updated', principal, userStore);
        }

        this.notifyUserItemUpdated(principal, userStore);
    }

    private notifyUserItemCreated(principal: Principal, userStore: IdProvider, sameTypeParent?: boolean) {
        this.userItemCreatedListeners.forEach(listener => {
            listener(principal, userStore, sameTypeParent);
        });
    }

    private notifyUserItemUpdated(principal: Principal, userStore: IdProvider) {
        this.userItemUpdatedListeners.forEach((listener: (principal: Principal, userStore: IdProvider) => void) => {
            listener(principal, userStore);
        });
    }

    onUserItemDeleted(listener: (ids: string[]) => void) {
        this.userItemDeletedListeners.push(listener);
    }

    unUserItemDeleted(listener: (ids: string[]) => void) {
        this.userItemDeletedListeners =
            this.userItemDeletedListeners.filter((currentListener: (ids: string[]) => void) => {
                return currentListener !== listener;
            });
    }

    private notifyUserItemDeleted(ids: string[]) {
        this.userItemDeletedListeners.forEach((listener: (ids: string[]) => void) => {
            listener(ids);
        });
    }
}
