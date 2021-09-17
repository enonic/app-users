import {Path} from 'lib-admin-ui/rest/Path';
import {Principal} from 'lib-admin-ui/security/Principal';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {IdProviderKey} from 'lib-admin-ui/security/IdProviderKey';
import {GetIdProviderByKeyRequest} from '../../graphql/idprovider/GetIdProviderByKeyRequest';
import {GetPrincipalByKeyRequest} from '../../graphql/principal/GetPrincipalByKeyRequest';
import {IdProvider} from '../principal/IdProvider';
import {NodeServerChangeType} from 'lib-admin-ui/event/NodeServerChange';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {PrincipalServerEvent} from './PrincipalServerEvent';
import {PrincipalServerChange} from './PrincipalServerChange';
import {PrincipalServerChangeItem} from './PrincipalServerChangeItem';

class PrincipalAndIdProvider {

    principal?: Principal;

    idProvider?: IdProvider;
}

/**
 * Class that listens to server events and fires UI events
 */
export class PrincipalServerEventsHandler {

    private static instance: PrincipalServerEventsHandler = new PrincipalServerEventsHandler();

    private handler: (event: PrincipalServerEvent) => void;

    private userItemCreatedListeners: { (principal: Principal, idProvider: IdProvider, sameTypeParent?: boolean): void }[] = [];
    private userItemUpdatedListeners: { (principal: Principal, idProvider: IdProvider): void }[] = [];
    private userItemDeletedListeners: { (ids: string[]): void }[] = [];

    private deletedItemsIds: string[] = [];

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
            setTimeout(this.handleUserItemEvent.bind(this, event), 1000);
        }
    }

    private isIgnoredItem(item: PrincipalServerChangeItem): boolean {
        const id: string = this.getId(item);
        if (!id) {
            return true;
        }
        const path: Path = Path.fromString(item.getPath());
        const name: string = path.getElement(path.getElements().length - 1);

        if (name === 'groups' || name === 'users' || name === 'roles') {
            return true;
        }

        return false;
    }

    onUserItemCreated(listener: (principal: Principal, idProvider: IdProvider, sameTypeParent?: boolean) => void): void {
        this.userItemCreatedListeners.push(listener);
    }

    unUserItemCreated(listener: (principal: Principal, idProvider: IdProvider, sameTypeParent?: boolean) => void): void {
        this.userItemCreatedListeners =
            this.userItemCreatedListeners.filter(currentListener => {
                return currentListener !== listener;
            });
    }

    onUserItemUpdated(listener: (principal: Principal, idProvider: IdProvider) => void): void {
        this.userItemUpdatedListeners.push(listener);
    }

    unUserItemUpdated(listener: (principal: Principal, idProvider: IdProvider) => void): void {
        this.userItemUpdatedListeners =
            this.userItemUpdatedListeners.filter((currentListener: (principal: Principal, idProvider: IdProvider) => void) => {
                return currentListener !== listener;
            });
    }

    private handleUserItemDeleted(ids: string[]) {
        if (PrincipalServerEventsHandler.debug) {
            console.debug('UserItemServerEventsHandler: deleted', ids);
        }

        this.deletedItemsIds.push(...ids);

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
     * Get <name> for idProviders, role:<name> for roles and ids otherwise
     * @param {PrincipalServerChangeItem} changeItem
     * @returns {string}
     */
    private getId(changeItem: PrincipalServerChangeItem): string {
        const path: Path = Path.fromString(changeItem.getPath());
        const name: string = path.getElement(path.getElements().length - 1);

        if (path.hasParent()) {
            return path.getParentPath().toString() === '/roles' ? 'role:' + name : changeItem.getId();
        }

        return name;
    }

    private handleUserItemEvent(event: PrincipalServerEvent) {
        const eventType: NodeServerChangeType = event.getType();

        event.getNodeChange().getChangeItems()
            .filter((item: PrincipalServerChangeItem) => this.isItemAllowedToProcess(item, eventType))
            .forEach((item: PrincipalServerChangeItem) => {
                this.doLoadUserItem(item)
                    .then((result: PrincipalAndIdProvider) => this.handleUserItem(result, eventType))
                    .then(() => this.cleanUp(item, eventType))
                    .catch(DefaultErrorHandler.handle);
            });
    }

    private isItemAllowedToProcess(item: PrincipalServerChangeItem, eventType: NodeServerChangeType): boolean {
        if (this.isIgnoredItem(item)) {
            return false;
        }

        if (eventType === NodeServerChangeType.UPDATE && this.isAlreadyDeleted(item)) { // issue with update event coming after delete
            return false;
        }

        return true;
    }

    private doLoadUserItem(item: PrincipalServerChangeItem): Q.Promise<PrincipalAndIdProvider> {
        const path: Path = Path.fromString(item.getPath());
        const id: string = this.getId(item);

        if (!path.hasParent()) {
            // it's a idProvider
            return this.fetchIdProvider(IdProviderKey.fromString(id)).then(idProvider => {
                return {idProvider};
            });
        }

        // it's a principal, fetch him as well as idProvider
        const key: PrincipalKey = PrincipalKey.fromString(id);

        if (key.isRole()) {
            return this.fetchPrincipal(key).then(principal => {
                return {principal};
            });
        }

        return this.fetchPrincipal(key, true).then((principal: Principal) => {
            return this.fetchIdProvider(principal.getKey().getIdProvider()).then((idProvider: IdProvider) => {
                return {principal, idProvider};
            });
        });
    }

    private isAlreadyDeleted(item: PrincipalServerChangeItem): boolean {
        return this.deletedItemsIds.indexOf(this.getId(item)) >= 0;
    }

    private fetchIdProvider(key: IdProviderKey): Q.Promise<IdProvider> {
        return new GetIdProviderByKeyRequest(key).sendAndParse();
    }

    private fetchPrincipal(key: PrincipalKey, indludeMemberships: boolean = false): Q.Promise<Principal> {
        return new GetPrincipalByKeyRequest(key).setIncludeMemberships(indludeMemberships).sendAndParse();
    }

    private handleUserItem(principalAndIdProvider: PrincipalAndIdProvider, eventType: NodeServerChangeType) {
        switch (eventType) {
            case NodeServerChangeType.CREATE:
                this.handleUserItemCreated(principalAndIdProvider.principal, principalAndIdProvider.idProvider);
                break;
            case NodeServerChangeType.UPDATE:
            case NodeServerChangeType.UPDATE_PERMISSIONS:
                this.handleUserItemUpdated(principalAndIdProvider.principal, principalAndIdProvider.idProvider);
                break;
        }
    }

    private handleUserItemCreated(principal: Principal, idProvider: IdProvider) {
        if (PrincipalServerEventsHandler.debug) {
            console.debug('UserItemServerEventsHandler: created', principal, idProvider);
        }

        this.notifyUserItemCreated(principal, idProvider, false);
    }

    private handleUserItemUpdated(principal: Principal, idProvider: IdProvider) {
        if (PrincipalServerEventsHandler.debug) {
            console.debug('UserItemServerEventsHandler: updated', principal, idProvider);
        }

        this.notifyUserItemUpdated(principal, idProvider);
    }

    private notifyUserItemCreated(principal: Principal, idProvider: IdProvider, sameTypeParent?: boolean) {
        this.userItemCreatedListeners.forEach(listener => {
            listener(principal, idProvider, sameTypeParent);
        });
    }

    private notifyUserItemUpdated(principal: Principal, idProvider: IdProvider) {
        this.userItemUpdatedListeners.forEach((listener: (principal: Principal, idProvider: IdProvider) => void) => {
            listener(principal, idProvider);
        });
    }

    private cleanUp(item: PrincipalServerChangeItem, eventType: NodeServerChangeType) {
        if (eventType === NodeServerChangeType.CREATE) {
            this.deletedItemsIds = this.deletedItemsIds.filter((deletedId: string) => deletedId !== this.getId(item));
        }
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
