import * as Q from 'q';
import {UserTreeGridItem, UserTreeGridItemBuilder, UserTreeGridItemType} from './UserTreeGridItem';
import {UserTreeGridActions} from './UserTreeGridActions';
import {EditPrincipalEvent} from './EditPrincipalEvent';
import {UserItemsRowFormatter} from './UserItemsRowFormatter';
import {ListIdProvidersRequest} from '../../graphql/idprovider/ListIdProvidersRequest';
import {ListPrincipalsRequest, ListPrincipalsData} from '../../graphql/principal/ListPrincipalsRequest';
import {PrincipalBrowseSearchData} from './filter/PrincipalBrowseSearchData';
import {UserItemType} from './UserItemType';
import {ListUserItemsRequest} from '../../graphql/principal/ListUserItemsRequest';
import {IdProvider} from '../principal/IdProvider';
import {TreeGrid} from 'lib-admin-ui/ui/treegrid/TreeGrid';
import {TreeNode} from 'lib-admin-ui/ui/treegrid/TreeNode';
import {TreeGridBuilder} from 'lib-admin-ui/ui/treegrid/TreeGridBuilder';
import {TreeGridContextMenu} from 'lib-admin-ui/ui/treegrid/TreeGridContextMenu';
import {Principal} from 'lib-admin-ui/security/Principal';
import {PrincipalType} from 'lib-admin-ui/security/PrincipalType';
import {BrowseFilterResetEvent} from 'lib-admin-ui/app/browse/filter/BrowseFilterResetEvent';
import {BrowseFilterSearchEvent} from 'lib-admin-ui/app/browse/filter/BrowseFilterSearchEvent';
import {ResponsiveRanges} from 'lib-admin-ui/ui/responsive/ResponsiveRanges';
import {UserItem} from 'lib-admin-ui/security/UserItem';
import {IdProviderKey} from 'lib-admin-ui/security/IdProviderKey';
import {Body} from 'lib-admin-ui/dom/Body';
import {i18n} from 'lib-admin-ui/util/Messages';
import {ListPrincipalsKeysResult, ListPrincipalsNamesRequest} from '../../graphql/principal/ListPrincipalsNamesRequest';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {GetPrincipalsExistenceRequest} from '../../graphql/principal/GetPrincipalsExistenceRequest';
import {UserFilteredDataScrollEvent} from '../event/UserFilteredDataScrollEvent';
import {AppHelper} from 'lib-admin-ui/util/AppHelper';

export class UserItemsTreeGrid
    extends TreeGrid<UserTreeGridItem> {

    private treeGridActions: UserTreeGridActions;
    private searchString: string;
    private searchTypes: UserItemType[];

    constructor() {

        const builder = new TreeGridBuilder<UserTreeGridItem>().setColumnConfig([{
            name: i18n('field.name'),
            id: 'name',
            field: 'displayName',
            formatter: UserItemsRowFormatter.nameFormatter,
            style: {minWidth: 200}
        }]).setPartialLoadEnabled(true).setLoadBufferSize(20).prependClasses('user-tree-grid');

        const columns = builder.getColumns().slice(0);
        const [nameColumn] = columns;

        const updateColumns = () => {
            let checkSelIsMoved = ResponsiveRanges._540_720.isFitOrSmaller(Body.get().getEl().getWidth());

            const curClass = nameColumn.getCssClass();

            if (checkSelIsMoved) {
                nameColumn.setCssClass(curClass || 'shifted');
            } else if (curClass && curClass.indexOf('shifted') >= 0) {
                nameColumn.setCssClass(curClass.replace('shifted', ''));
            }

            this.setColumns(columns.slice(0), checkSelIsMoved);
        };

        builder.setColumnUpdater(updateColumns);

        super(builder);

        this.treeGridActions = new UserTreeGridActions(this);

        this.setContextMenu(new TreeGridContextMenu(this.treeGridActions));

        this.initEventHandlers();
    }

    protected isSelectableNode(node: TreeNode<UserTreeGridItem>): boolean {
        return this.isUserItemEditable(node.getData());
    }

    private initEventHandlers() {
        const triggerFilteredDataScrollEvent = AppHelper.debounce(() => {

            const currentNumberOfItems = this.getRoot().getCurrentRoot().getChildren().length;
            const numberOfItemsToAdd = 30;
            const nextNumberOfItems = currentNumberOfItems + numberOfItemsToAdd;

            if(this.getGrid().getViewport().bottom === currentNumberOfItems){
                new UserFilteredDataScrollEvent(nextNumberOfItems).fire();
            }
        }, 100);

        BrowseFilterSearchEvent.on((event: BrowseFilterSearchEvent<PrincipalBrowseSearchData>) => {
            const data = event.getData();
            const items = data.getUserItems().map((userItem: UserItem) => {
                return new UserTreeGridItemBuilder().setAny(userItem).build();
            });
            this.searchString = data.getSearchString();
            this.searchTypes = data.getTypes();
            this.filter(items);
            this.notifyLoaded();

            this.getGrid().subscribeOnScroll(triggerFilteredDataScrollEvent);
        });

        BrowseFilterResetEvent.on(() => {
            this.resetFilter();

            this.getGrid().unsubscribeOnScroll(triggerFilteredDataScrollEvent);
        });

        this.getGrid().subscribeOnDblClick((event, data) => {

            if (this.isActive()) {
                const node: TreeNode<UserTreeGridItem> = this.getGrid().getDataView().getItem(data.row);
                this.editItem(node);
            }
        });
    }

    protected editItem(node: TreeNode<UserTreeGridItem>): void {
        if (this.isUserItemEditable(node.getData())) {
            new EditPrincipalEvent([node.getData()]).fire();
        }
    }

    private isUserItemEditable(userItem: UserTreeGridItem): boolean {
        return !(userItem.isRole() || userItem.isUserGroup() || userItem.isUser());
    }

    isEmptyNode(node: TreeNode<UserTreeGridItem>): boolean {
        return !node.getDataId() || node.getDataId() === '';
    }

    getTreeGridActions(): UserTreeGridActions {
        return this.treeGridActions;
    }

    updateUserNode(principal: Principal, idProvider: IdProvider): void {
        if (!principal && !idProvider) {
            return;
        }

        let userTreeGridItem: UserTreeGridItem;
        const builder: UserTreeGridItemBuilder = new UserTreeGridItemBuilder();

        if (!principal) { // IdProvider type
            userTreeGridItem = builder.setIdProvider(idProvider).setType(UserTreeGridItemType.ID_PROVIDER).build();
        } else {         // Principal type
            userTreeGridItem = builder.setPrincipal(principal).setType(UserTreeGridItemType.PRINCIPAL).build();
        }

        const nodeList: TreeNode<UserTreeGridItem>[] = this.getRoot().getCurrentRoot().treeToList();

        nodeList.forEach((node) => {
            if (node.getDataId() === userTreeGridItem.getId()) {
                node.setData(userTreeGridItem);
                node.clearViewers();
            }
        });

        this.initData(nodeList);
        this.invalidate();
    }

    appendUserItemNode(principal: Principal, idProvider: IdProvider): void {
        if (!principal) {
            this.appendIdProviderNode(idProvider);
        } else {
            this.appendPrincipalNode(principal, idProvider);
        }
    }

    private appendIdProviderNode(idProvider: IdProvider) {
        const userTreeGridItem = new UserTreeGridItemBuilder().setIdProvider(idProvider).setType(
            UserTreeGridItemType.ID_PROVIDER).build();

        this.insertDataToParentNode(userTreeGridItem, this.getRoot().getDefaultRoot(), this.getIdProviderInsertIndex(idProvider));
    }

    private getIdProviderInsertIndex(idProvider: IdProvider): number {
        const idProvidersNames: string[] =
            this.getRoot().getDefaultRoot().getChildren().slice(1).map(
                (node: TreeNode<UserTreeGridItem>) => node.getData().getItemDisplayName());

        return this.doGetPrincipalIndex(idProvidersNames, idProvider.getDisplayName()) + 1;
    }

    private appendPrincipalNode(principal: Principal, idProvider: IdProvider) {
        const parentNode: TreeNode<UserTreeGridItem> = this.getRoot().getNodeByDataId(this.getPrincipalParentDataId(principal, idProvider));

        if (parentNode) {
            if (parentNode.isExpandable() && !parentNode.hasChildren()) {
                return;
            }

            const userTreeGridItem: UserTreeGridItem = new UserTreeGridItemBuilder().setPrincipal(principal).setType(
                UserTreeGridItemType.PRINCIPAL).build();
            this.getPrincipalIndex(parentNode, userTreeGridItem).then((insertIndex: number) => {
                this.insertDataToParentNode(userTreeGridItem, parentNode, insertIndex);
            }).catch(DefaultErrorHandler.handle);
        }
    }

    private getPrincipalIndex(parentNode: TreeNode<UserTreeGridItem>, userTreeGridItem: UserTreeGridItem): Q.Promise<number> {
        return new ListPrincipalsNamesRequest()
            .setIdProviderKey(this.getIdProviderKey(parentNode))
            .setTypes([this.getPrincipalTypeForFolderItem(parentNode.getData().getType())])
            .setSort('displayName ASC')
            .sendAndParse()
            .then((result: ListPrincipalsKeysResult) => {
                return this.doGetPrincipalIndex(result.displayNames, userTreeGridItem.getItemDisplayName());
            });
    }

    private doGetPrincipalIndex(displayNames: string[], item: string): number {
        let insertIndex: number = 0;

        displayNames.some((dn: string, index: number) => {
            insertIndex = index;
            return dn.localeCompare(item) >= 0;
        });

        return insertIndex;
    }

    private getPrincipalParentDataId(principal: Principal, idProvider: IdProvider): string {
        if (principal.getType() === PrincipalType.USER) {
            return idProvider.getKey().toString() + '/users';
        }

        if (principal.getType() === PrincipalType.GROUP) {
            return idProvider.getKey().toString() + '/groups';
        }

        return '/roles';
    }

    fetchChildren(parentNode?: TreeNode<UserTreeGridItem>): Q.Promise<UserTreeGridItem[]> {
        parentNode = parentNode || this.getRoot().getCurrentRoot();

        let level: number = parentNode ? parentNode.calcLevel() : 0;

        // Creating a role with parent node pointing to another role may cause fetching to fail
        // We need to select a parent node first
        if (level !== 0 && parentNode.getData().getPrincipal() &&
            parentNode.getData().isPrincipal() &&
            parentNode.getData().getPrincipal().isRole() && !!parentNode.getParent()) {

            parentNode = parentNode.getParent();
            level--;
        }

        if (level === 0) {
            return this.isFiltered() ? this.fetchFilteredItems() : this.fetchIdProvidersAndRoles();
        }

        if (parentNode.getData().isRole()) {
            return this.fetchRoles(parentNode);
        }

        if (level === 1) {
            return this.createUsersAndGroupsFolders(parentNode);
        }

        if (level === 2) {
            return this.fetchPrincipals(parentNode);
        }
    }

    private fetchFilteredItems(): Q.Promise<UserTreeGridItem[]> {
        return new ListUserItemsRequest().setCount(100).setTypes(this.searchTypes).setQuery(this.searchString).sendAndParse()
            .then((result) => {
                return result.userItems.map(item => new UserTreeGridItemBuilder().setAny(item).build());
            });
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

    private fetchRoles(parentNode: TreeNode<UserTreeGridItem>): Q.Promise<UserTreeGridItem[]> {
        return this.loadChildren(parentNode, [PrincipalType.ROLE]);
    }

    private createUsersAndGroupsFolders(parentNode: TreeNode<UserTreeGridItem>): Q.Promise<UserTreeGridItem[]> {
        const idProviderNode: UserTreeGridItem = parentNode.getData();
        if (idProviderNode.isIdProvider()) {
            return Q(this.addUsersGroupsToIdProvider(idProviderNode));
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

    private fetchPrincipals(parentNode: TreeNode<UserTreeGridItem>): Q.Promise<UserTreeGridItem[]> {
        const folder: UserTreeGridItem = parentNode.getData();
        const principalType: PrincipalType = this.getPrincipalTypeForFolderItem(folder.getType());

        return this.loadChildren(parentNode, [principalType]);
    }

    hasChildren(item: UserTreeGridItem): boolean {
        return item.hasChildren();
    }

    private loadChildren(parentNode: TreeNode<UserTreeGridItem>, allowedTypes: PrincipalType[]): Q.Promise<UserTreeGridItem[]> {
        this.removeEmptyNode(parentNode);
        const from: number = parentNode.getChildren().length;
        const gridItems: UserTreeGridItem[] = parentNode.getChildren().map((el) => el.getData()).slice(0, from);

        return new ListPrincipalsRequest()
            .setIdProviderKey(this.getIdProviderKey(parentNode))
            .setTypes(allowedTypes)
            .setSort('displayName ASC')
            .setStart(from)
            .setCount(10)
            .sendAndParse()
            .then((result: ListPrincipalsData) => {
                const principals: Principal[] = result.principals;

                principals.forEach((principal: Principal) => {
                    gridItems.push(
                        new UserTreeGridItemBuilder().setPrincipal(principal).setType(UserTreeGridItemType.PRINCIPAL).build());
                });

                if (from + principals.length < result.total) {
                    gridItems.push(UserTreeGridItem.create().build());
                }

                return gridItems;
            });
    }

    private removeEmptyNode(parentNode: TreeNode<UserTreeGridItem>) {
        parentNode.getChildren().some((child: TreeNode<UserTreeGridItem>, index: number) => {
            if (!child.getData().getId()) {
                parentNode.getChildren().splice(index, 1);
                return true;
            }

            return false;
        });
    }

    private getIdProviderKey(parentNode: TreeNode<UserTreeGridItem>): IdProviderKey {
        // fetch principals from the id provider, if parent node 'Groups' or 'Users' was selected
        if (!parentNode.getData().isRole()) {
            const idProviderNode: UserTreeGridItem = parentNode.getParent().getData();
            return idProviderNode.getIdProvider().getKey();
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

    private isSingleItemSelected(): boolean {
        return this.getSelectedDataList().length === 1;
    }

    private isHighlightedItemIn(userTreeGridItems: UserTreeGridItem[]): boolean {
        return userTreeGridItems.some((userTreeGridItem: UserTreeGridItem) => {
            return userTreeGridItem.getId() === this.getFirstSelectedOrHighlightedItem().getId();
        });
    }

}
