import {Path} from 'lib-admin-ui/rest/Path';
import {PrincipalServerEvent} from 'lib-admin-ui/security/event/PrincipalServerEvent';
import {PrincipalServerChange, PrincipalServerChangeItem} from 'lib-admin-ui/security/event/PrincipalServerChange';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {IdProviderKey} from 'lib-admin-ui/security/IdProviderKey';
import {GetIdProviderByKeyRequest} from '../../graphql/idprovider/GetIdProviderByKeyRequest';
import {IdProvider} from '../principal/IdProvider';
import {NodeServerChangeType} from 'lib-admin-ui/event/NodeServerChange';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';

/**
 * Class that listens to server events and fires UI events
 */
export class PrincipalServerEventsHandler {

    private static instance: PrincipalServerEventsHandler = new PrincipalServerEventsHandler();

    private handler: (event: PrincipalServerEvent) => void;

    private principalCreatedListeners: { (key: PrincipalKey): void }[] = [];
    private principalUpdatedListeners: { (key: PrincipalKey): void }[] = [];
    private idProviderCreatedListeners: { (idProvider: IdProvider): void }[] = [];
    private idProviderUpdatedListeners: { (idProvider: IdProvider): void }[] = [];
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
            this.handlePrincipalDeleted(this.extractPrincipalIds([event.getNodeChange()]));
        } else {
            // allow some time for the backend to process items before requesting them
            setTimeout(this.handleUserItemServerEvent.bind(this, event), 1000);
        }
    }

    private handlePrincipalDeleted(ids: string[]) {
        if (PrincipalServerEventsHandler.debug) {
            console.debug('UserItemServerEventsHandler: deleted', ids);
        }

        this.notifyPrincipalDeleted(ids);
    }

    private notifyPrincipalDeleted(ids: string[]) {
        this.userItemDeletedListeners.forEach((listener: (ids: string[]) => void) => {
            listener(ids);
        });
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
        const path = Path.fromString(changeItem.getPath());
        const name = path.getElement(path.getElements().length - 1);
        if (path.hasParent()) {
            return path.getParentPath().toString() === '/roles' ? 'role:' + name : changeItem.getId();
        }

        return name;
    }

    private handleUserItemServerEvent(event: PrincipalServerEvent) {
        event.getNodeChange().getChangeItems().forEach((item: PrincipalServerChangeItem) => {

            if (this.isIgnoredItem(item)) {
                return;
            }

            const path: Path = Path.fromString(item.getPath());
            const id: string = this.getId(item);
            if (path.hasParent()) {
                // it's a principal, fetch him as well as idProvider
                const key: PrincipalKey = PrincipalKey.fromString(id);
                this.onPrincipalCreateUpdate(event.getType(), key);
            } else {
                // it's a idProvider
                new GetIdProviderByKeyRequest(IdProviderKey.fromString(id)).sendAndParse().then((idProvider: IdProvider) => {
                    if (PrincipalServerEventsHandler.debug) {
                        console.debug('PrincipalServerEventsHandler.loaded idprovider:', idProvider);
                    }
                    if (idProvider) {
                        this.onIdProviderCreateUpdate(event.getType(), idProvider);
                    }
                }).catch(DefaultErrorHandler.handle);
            }
        });
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

    private onPrincipalCreateUpdate(eventType: NodeServerChangeType, key: PrincipalKey) {
        switch (eventType) {
        case NodeServerChangeType.CREATE:
            this.handlePrincipalCreated(key);
            break;
        case NodeServerChangeType.UPDATE:
        case NodeServerChangeType.UPDATE_PERMISSIONS:
            this.handlePrincipalUpdated(key);
            break;
        }
    }

    private handlePrincipalCreated(key: PrincipalKey) {
        if (PrincipalServerEventsHandler.debug) {
            console.debug('UserItemServerEventsHandler: created', key);
        }

        this.notifyPrincipalCreated(key);
    }

    private notifyPrincipalCreated(key: PrincipalKey) {
        this.principalCreatedListeners.forEach(listener => {
            listener(key);
        });
    }

    private handlePrincipalUpdated(key: PrincipalKey) {
        if (PrincipalServerEventsHandler.debug) {
            console.debug('UserItemServerEventsHandler: updated', key);
        }

        this.notifyPrincipalUpdated(key);
    }

    private notifyPrincipalUpdated(key: PrincipalKey) {
        this.principalUpdatedListeners.forEach((listener: (key: PrincipalKey) => void) => {
            listener(key);
        });
    }

    private onIdProviderCreateUpdate(eventType: NodeServerChangeType, idProvider: IdProvider) {
        switch (eventType) {
        case NodeServerChangeType.CREATE:
            this.handleIdProviderCreated(idProvider);
            break;
        case NodeServerChangeType.UPDATE:
        case NodeServerChangeType.UPDATE_PERMISSIONS:
            this.handleIdProviderUpdated(idProvider);
            break;
        }
    }

    private handleIdProviderCreated(idProvider: IdProvider) {
        if (PrincipalServerEventsHandler.debug) {
            console.debug('UserItemServerEventsHandler: created', idProvider.getKey());
        }

        this.notifyIdProviderCreated(idProvider);
    }

    private notifyIdProviderCreated(idProvider: IdProvider) {
        this.idProviderCreatedListeners.forEach(listener => {
            listener(idProvider);
        });
    }

    private handleIdProviderUpdated(idProvider: IdProvider) {
        if (PrincipalServerEventsHandler.debug) {
            console.debug('UserItemServerEventsHandler: updated', idProvider);
        }

        this.notifyIdProviderUpdated(idProvider);
    }

    private notifyIdProviderUpdated(idProvider: IdProvider) {
        this.idProviderUpdatedListeners.forEach((listener: (idProvider: IdProvider) => void) => {
            listener(idProvider);
        });
    }

    onPrincipalCreated(listener: (key: PrincipalKey) => void) {
        this.principalCreatedListeners.push(listener);
    }

    unPrincipalCreated(listener: (key: PrincipalKey) => void) {
        this.principalCreatedListeners =
            this.principalCreatedListeners.filter(currentListener => {
                return currentListener !== listener;
            });
    }

    onPrincipalUpdated(listener: (key: PrincipalKey) => void) {
        this.principalUpdatedListeners.push(listener);
    }

    unPrincipalUpdated(listener: (key: PrincipalKey) => void) {
        this.principalUpdatedListeners =
            this.principalUpdatedListeners.filter((currentListener: (key: PrincipalKey) => void) => {
                return currentListener !== listener;
            });
    }

    onIdProviderCreated(listener: (idProvider: IdProvider) => void) {
        this.idProviderCreatedListeners.push(listener);
    }

    unIdProviderCreated(listener: (idProvider: IdProvider) => void) {
        this.idProviderCreatedListeners =
            this.idProviderCreatedListeners.filter(currentListener => {
                return currentListener !== listener;
            });
    }

    onIdProviderUpdated(listener: (idProvider: IdProvider) => void) {
        this.idProviderUpdatedListeners.push(listener);
    }

    unIdProviderUpdated(listener: (idProvider: IdProvider) => void) {
        this.idProviderUpdatedListeners =
            this.idProviderUpdatedListeners.filter((currentListener: (idProvider: IdProvider) => void) => {
                return currentListener !== listener;
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
}
