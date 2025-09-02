import Q from 'q';
import {UserTreeGridItem, UserTreeGridItemBuilder, UserTreeGridItemType} from './UserTreeGridItem';
import {ListIdProvidersRequest} from '../../graphql/idprovider/ListIdProvidersRequest';
import {ListPrincipalsData, ListPrincipalsRequest} from '../../graphql/principal/ListPrincipalsRequest';
import {IdProvider} from '../principal/IdProvider';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {PrincipalType} from '@enonic/lib-admin-ui/security/PrincipalType';
import {IdProviderKey} from '@enonic/lib-admin-ui/security/IdProviderKey';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {GetPrincipalsExistenceRequest} from '../../graphql/principal/GetPrincipalsExistenceRequest';
import {TreeListBox, TreeListBoxParams, TreeListElement, TreeListElementParams} from '@enonic/lib-admin-ui/ui/selector/list/TreeListBox';
import {UserTreeGridItemViewer} from './UserTreeGridItemViewer';

export class UserItemsTreeList
    extends TreeListBox<UserTreeGridItem> {

    private wasShownAndLoaded: boolean = false;

    constructor(params?: TreeListBoxParams<UserTreeGridItem>) {
        super(params);
    }

    protected createItemView(item: UserTreeGridItem, readOnly: boolean): UserItemsTreeListElement {
        return new UserItemsTreeListElement(item,
            {scrollParent: this.scrollParent, parentList: this});
    }

    protected getItemId(item: UserTreeGridItem): string {
        return item.getId();
    }

    protected handleLazyLoad(): void {
        if (this.isLoadAllowed()) {
            this.doLoad();
        }
    }

    protected isLoadAllowed(): boolean {
        const level = this.getLevel();

        if (level === 0) { // root, load once and only if empty
            return this.getItemCount() === 0;
        }

        if (this.getParentItem()?.isRole()) { // roles are lazily loaded
            return true;
        }

        if (level === 1) { // static users and groups folders, load only if not added yet
            return this.getItemCount() === 0;
        }

        if (level === 2) { // principals under users and groups folders, load lazily
            return true;
        }

        return false;
    }

    load(): void {
        this.clearItems();
        this.doLoad();
    }

    protected doLoad(): void {
        this.wasShownAndLoaded = true;

        this.fetchItems().then((items: UserTreeGridItem[]) => {
            if (items.length > 0) {
                this.addItems(items);
            }
        }).catch(DefaultErrorHandler.handle);
    }

    protected fetchItems(): Q.Promise<UserTreeGridItem[]> {
        return this.isRoot() ? this.fetchRoot() : this.fetchChildren();
    }

    private isRoot(): boolean {
        return !this.options.parentListElement;
    }

    wasAlreadyShownAndLoaded(): boolean {
        return this.wasShownAndLoaded;
    }

    protected fetchRoot(): Q.Promise<UserTreeGridItem[]> {
        return this.fetchIdProvidersAndRoles();
    }

    protected fetchChildren(): Q.Promise<UserTreeGridItem[]> {
        const parentItem = this.getParentItem();

        if (parentItem.isRole()) {
            return this.fetchRoles();
        }

        const level = this.getLevel();

        if (level === 1) {
            return this.createUsersAndGroupsFolders(parentItem);
        }

        if (level === 2) {
            return this.fetchPrincipals(parentItem);
        }
    }

    private fetchIdProvidersAndRoles(): Q.Promise<UserTreeGridItem[]> {
        return new ListIdProvidersRequest()
            .setSort('displayName ASC')
            .sendAndParse()
            .then((idProviders: IdProvider[]) => {
                const gridItems: UserTreeGridItem[] = [];
                gridItems.push(new UserTreeGridItemBuilder().setType(UserTreeGridItemType.ROLES).build());
                idProviders.forEach((idProvider: IdProvider) => {
                    gridItems.push(
                        new UserTreeGridItemBuilder().setIdProvider(idProvider).setType(UserTreeGridItemType.ID_PROVIDER).build());
                });

                return gridItems;
            });
    }

    private fetchRoles(): Q.Promise<UserTreeGridItem[]> {
        return this.loadChildren([PrincipalType.ROLE]);
    }

    private createUsersAndGroupsFolders(parentItem: UserTreeGridItem): Q.Promise<UserTreeGridItem[]> {
        if (parentItem.isIdProvider()) {
            return Q(this.addUsersGroupsToIdProvider(parentItem));
        }

        return Q([]);
    }

    private addUsersGroupsToIdProvider(parentItem: UserTreeGridItem): Q.Promise<UserTreeGridItem[]> {
        const idProvider: IdProvider = parentItem.getIdProvider();
        const promises: Q.Promise<boolean>[] = [];

        promises.push(this.getTotalPrincipals(idProvider.getKey(), PrincipalType.USER));
        promises.push(this.getTotalPrincipals(idProvider.getKey(), PrincipalType.GROUP));

        return Q.all(promises).spread((hasUsers: boolean, hasGroups: boolean) => {
            const userFolderItem: UserTreeGridItem =
                new UserTreeGridItemBuilder()
                    .setIdProvider(idProvider)
                    .setType(UserTreeGridItemType.USERS)
                    .setHasChildren(hasUsers)
                    .build();
            const groupFolderItem: UserTreeGridItem =
                new UserTreeGridItemBuilder()
                    .setIdProvider(idProvider)
                    .setType(UserTreeGridItemType.GROUPS)
                    .setHasChildren(hasGroups)
                    .build();
            return [userFolderItem, groupFolderItem];
        });
    }

    private getTotalPrincipals(idProviderKey: IdProviderKey, type: PrincipalType): Q.Promise<boolean> {
        return new GetPrincipalsExistenceRequest()
            .setIdProviderKey(idProviderKey)
            .setTypes([type])
            .sendAndParse();
    }

    private fetchPrincipals(folder: UserTreeGridItem): Q.Promise<UserTreeGridItem[]> {
        const principalType: PrincipalType = this.getPrincipalTypeForFolderItem(folder.getType());

        return this.loadChildren([principalType]);
    }

    private loadChildren(allowedTypes: PrincipalType[]): Q.Promise<UserTreeGridItem[]> {
        const from: number = this.getItemCount();
        const idProvider = this.getIdProvider();

        return new ListPrincipalsRequest()
            .setIdProviderKey(idProvider?.getKey())
            .setTypes(allowedTypes)
            .setSort('displayName ASC')
            .setStart(from)
            .setCount(10)
            .sendAndParse()
            .then((result: ListPrincipalsData) => {
                return result.principals.map((principal: Principal) => {
                    return new UserTreeGridItemBuilder().setPrincipal(principal).setIdProvider(idProvider).setType(
                        UserTreeGridItemType.PRINCIPAL).build();
                });
            });
    }

    private getIdProvider(): IdProvider {
        // fetch principals from the id provider, if parent node 'Groups' or 'Users' was selected

        let parentList = this as UserItemsTreeList;

        while (parentList.getLevel() > 1) {
            parentList = parentList.getParentList() as UserItemsTreeList;
        }

        const parentItem = parentList.getParentItem();

        if (!parentItem.isRole()) {
            return parentItem.getIdProvider();
        }

        return null;
    }

    private getPrincipalTypeForFolderItem(itemType: UserTreeGridItemType): PrincipalType {
        if (itemType === UserTreeGridItemType.GROUPS) {
            return PrincipalType.GROUP;
        }

        if (itemType === UserTreeGridItemType.USERS) {
            return PrincipalType.USER;
        }

        if (itemType === UserTreeGridItemType.ROLES) {
            return PrincipalType.ROLE;
        }

        throw new Error('Invalid item type for folder with principals: ' + UserTreeGridItemType[itemType]);
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered) => {
            this.addClass('user-items-tree-list');

            return rendered;
        });
    }

}

export class UserItemsTreeListElement
    extends TreeListElement<UserTreeGridItem> {

    constructor(item: UserTreeGridItem, params: TreeListElementParams<UserTreeGridItem>) {
        super(item, params);
    }

    protected createChildrenList(params?: TreeListBoxParams<UserTreeGridItem>): UserItemsTreeList {
        return new UserItemsTreeList(params);
    }

    hasChildren(): boolean {
        return this.item.hasChildren();
    }

    protected createItemViewer(item: UserTreeGridItem): UserTreeGridItemViewer {
        const viewer = new UserTreeGridItemViewer();
        viewer.setObject(item);
        viewer.setIsRelativePath(this.getLevel() > 0);
        return viewer;
    }

    setItem(item: UserTreeGridItem): void {
        super.setItem(item);
        (this.itemViewer as UserTreeGridItemViewer).setObject(item);
        this.updateExpandableState();
    }
}
