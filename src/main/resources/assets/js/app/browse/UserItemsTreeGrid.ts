import * as Q from 'q';
import {UserTreeGridItem, UserTreeGridItemBuilder, UserTreeGridItemType} from './UserTreeGridItem';
import {UserTreeGridActions} from './UserTreeGridActions';
import {EditPrincipalEvent} from './EditPrincipalEvent';
import {UserItemsRowFormatter} from './UserItemsRowFormatter';
import {ListIdProvidersRequest} from '../../graphql/idprovider/ListIdProvidersRequest';
import {ListPrincipalsRequest, ListPrincipalsResult} from '../../graphql/principal/ListPrincipalsRequest';
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
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {GetPrincipalByKeyRequest} from '../../graphql/principal/GetPrincipalByKeyRequest';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';

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

    private initEventHandlers() {
        BrowseFilterSearchEvent.on((event: BrowseFilterSearchEvent<PrincipalBrowseSearchData>) => {
            const data = event.getData();
            const items = data.getUserItems().map((userItem: UserItem) => {
                return new UserTreeGridItemBuilder().setAny(userItem).build();
            });
            this.searchString = data.getSearchString();
            this.searchTypes = data.getTypes();
            this.filter(items);
            this.notifyLoaded();
        });

        BrowseFilterResetEvent.on(() => {
            this.resetFilter();
        });

        this.getGrid().subscribeOnDblClick((event, data) => {

            if (this.isActive()) {
                const node: TreeNode<UserTreeGridItem> = this.getGrid().getDataView().getItem(data.row);
                this.editItem(node);
            }
        });
    }

    protected editItem(node: TreeNode<UserTreeGridItem>) {
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

    appendIdProviderUserNode(idProvider: IdProvider) {
        const insertIndex: number = this.getIndexToInsertNewIdProvider(idProvider);
        const newIdProviderNode: TreeNode<UserTreeGridItem> = this.createNodeFromIdProvider(idProvider);
        const rootNode: TreeNode<UserTreeGridItem> = this.getRoot().getDefaultRoot();

        if (insertIndex > 0) {
            rootNode.insertChild(newIdProviderNode, insertIndex);
        } else {
            rootNode.addChild(newIdProviderNode);
        }

        this.initData(this.getRoot().getDefaultRoot().treeToList());
    }

    private getIndexToInsertNewIdProvider(newIdProvider: IdProvider): number {
        const rootNodes: TreeNode<UserTreeGridItem>[] = this.getRoot().getDefaultRoot().getChildren();

        const idProviderDisplayName: string = newIdProvider.getDisplayName();
        let insertIndex: number = 0;

        rootNodes.some((rootNode: TreeNode<UserTreeGridItem>, index: number) => {
            if (rootNode.getData().getType() === UserTreeGridItemType.ID_PROVIDER) {
                const existingIdProvider: IdProvider = rootNode.getData().getIdProvider();
                if (existingIdProvider.getDisplayName().localeCompare(idProviderDisplayName) > 0) {
                    insertIndex = index;
                    return true;
                }
            }
            return false;
        });

        return insertIndex;
    }

    private createNodeFromIdProvider(idProvider: IdProvider): TreeNode<UserTreeGridItem> {
        const userTreeGridItem: UserTreeGridItem =
            new UserTreeGridItemBuilder().setIdProvider(idProvider).setType(UserTreeGridItemType.ID_PROVIDER).build();

        return this.dataToTreeNode(userTreeGridItem, this.getRoot().getDefaultRoot());
    }

    updateIdProviderNode(idProvider: IdProvider) {
        const nodesToUpdate: TreeNode<UserTreeGridItem>[] = this.getNodesToUpdate(idProvider.getKey().toString());

        if (nodesToUpdate.length === 0) {
            return;
        }

        const userTreeGridItem: UserTreeGridItem =
            new UserTreeGridItemBuilder().setIdProvider(idProvider).setType(UserTreeGridItemType.ID_PROVIDER).build();

        nodesToUpdate.forEach((nodeToUpdate: TreeNode<UserTreeGridItem>) => {
            nodeToUpdate.setData(userTreeGridItem);
            nodeToUpdate.clearViewers();
        });

        this.invalidateNodes(nodesToUpdate);
    }

    updatePrincipalNode(key: PrincipalKey) {
        const nodesToUpdate: TreeNode<UserTreeGridItem>[] = this.getNodesToUpdate(key.toString());

        if (nodesToUpdate.length === 0) {
            return;
        }

        new GetPrincipalByKeyRequest(key).sendAndParse().then((principal: Principal) => {
            const userTreeGridItem: UserTreeGridItem =
                new UserTreeGridItemBuilder().setPrincipal(principal).setType(UserTreeGridItemType.PRINCIPAL).build();

            nodesToUpdate.forEach((nodeToUpdate: TreeNode<UserTreeGridItem>) => {
                nodeToUpdate.setData(userTreeGridItem);
                nodeToUpdate.clearViewers();
            });

            this.invalidateNodes(nodesToUpdate);
        }).catch(DefaultErrorHandler.handle);
    }

    private getNodesToUpdate(keyAsString: string): TreeNode<UserTreeGridItem>[] {
        const nodesToUpdate: TreeNode<UserTreeGridItem>[] = [];

        const defaultRootNodeToUpdate: TreeNode<UserTreeGridItem> = this.getNodeById(keyAsString);
        if (defaultRootNodeToUpdate) {
            nodesToUpdate.push(defaultRootNodeToUpdate);
        }

        if (this.isFiltered()) {
            const filteredRootNodeToUpdate: TreeNode<UserTreeGridItem> = this.getNodeById(keyAsString, true);
            if (!!filteredRootNodeToUpdate) {
                nodesToUpdate.push(filteredRootNodeToUpdate);
            }
        }

        return nodesToUpdate;
    }

    private getNodeById(id: string, fromFilteredRoot?: boolean): TreeNode<UserTreeGridItem> {
        const nodeList: TreeNode<UserTreeGridItem>[] = fromFilteredRoot ? this.getRoot().getFilteredRoot().treeToList() :
                                                       this.getRoot().getDefaultRoot().treeToList();

        let result: TreeNode<UserTreeGridItem> = null;

        nodeList.some((node: TreeNode<UserTreeGridItem>) => {
            if (node.getDataId() === id) {
                result = node;
                return true;
            }

            return false;
        });

        return result;
    }

    deleteNodes(userTreeGridItemsToDelete: UserTreeGridItem[]) {
        if (this.isSingleItemSelected() && this.isHighlightedItemIn(userTreeGridItemsToDelete)) {
            this.removeHighlighting();
        }

        super.deleteNodes(userTreeGridItemsToDelete);
    }

    appendPrincipalNode(key: PrincipalKey) {
        if (key.isRole()) {
            this.reloadRolesNode();
            return;
        }

        if (key.isGroup()) {
            this.reloadGroupsNode(key.getIdProvider());
            return;
        }

        if (key.isUser()) {
            this.reloadUsersNode(key.getIdProvider());
            return;
        }
    }

    private reloadRolesNode() {
        const rolesNode: TreeNode<UserTreeGridItem> = this.getRolesNode();

        if (!rolesNode.isExpanded() && !rolesNode.hasChildren()) {
            return;
        }

        this.loadChildren(null, 0, [PrincipalType.ROLE], rolesNode.getChildren().length).then((items: UserTreeGridItem[]) => {
            rolesNode.setChildren(this.dataToTreeNodes(items, rolesNode));
            this.initData(this.getRoot().getDefaultRoot().treeToList());
        });
    }

    private getRolesNode(): TreeNode<UserTreeGridItem> {
        const rootNode: TreeNode<UserTreeGridItem> = this.getRoot().getDefaultRoot();

        const rolesNode: TreeNode<UserTreeGridItem> = rootNode.getChildren()
            .filter(node => node.getData() && node.getData().getType() === UserTreeGridItemType.ROLES)[0];

        return rolesNode;
    }

    private reloadGroupsNode(idProviderKey: IdProviderKey) {
        const groupsNode: TreeNode<UserTreeGridItem> = this.getGroupsNodeByIdProvider(idProviderKey);

        if (!groupsNode) {
            return;
        }

        if (!groupsNode.isExpanded() && !groupsNode.hasChildren()) {
            return;
        }

        this.loadChildren(idProviderKey, 0, [PrincipalType.GROUP], groupsNode.getChildren().length).then((items: UserTreeGridItem[]) => {
            groupsNode.setChildren(this.dataToTreeNodes(items, groupsNode));
            this.initData(this.getRoot().getDefaultRoot().treeToList());
        });
    }

    private getGroupsNodeByIdProvider(idProviderKey: IdProviderKey): TreeNode<UserTreeGridItem> {
        const idProviderNode: TreeNode<UserTreeGridItem> = this.getIdProviderNode(idProviderKey);

        if (!idProviderNode) {
            return;
        }

        return this.getGroupsNodeFromIdProviderNode(idProviderNode);
    }

    private getIdProviderNode(idProviderKey: IdProviderKey): TreeNode<UserTreeGridItem> {
        const rootNode: TreeNode<UserTreeGridItem> = this.getRoot().getDefaultRoot();

        let idProviderNode: TreeNode<UserTreeGridItem> = null;

        rootNode.getChildren().some((node: TreeNode<UserTreeGridItem>) => {
            if (node.getData() && node.getDataId() === idProviderKey.toString()) {
                idProviderNode = node;
                return true;
            }

            return false;
        });

        return idProviderNode;
    }

    private getGroupsNodeFromIdProviderNode(idProviderNode: TreeNode<UserTreeGridItem>): TreeNode<UserTreeGridItem> {
        let groupsNode: TreeNode<UserTreeGridItem> = null;

        idProviderNode.getChildren().some((node: TreeNode<UserTreeGridItem>) => {
            if (!node.getData()) {
                return false;
            }

            if (node.getData().getType() === UserTreeGridItemType.GROUPS) {
                groupsNode = node;
                return true;
            }

            return false;
        });

        return groupsNode;
    }

    private reloadUsersNode(idProviderKey: IdProviderKey) {
        const usersNode: TreeNode<UserTreeGridItem> = this.getUsersNodeByIdProvider(idProviderKey);

        if (!usersNode) {
            return;
        }

        if (!usersNode.isExpanded() && !usersNode.hasChildren()) {
            return;
        }

        this.loadChildren(idProviderKey, 0, [PrincipalType.USER], usersNode.getChildren().length).then((items: UserTreeGridItem[]) => {
            usersNode.setChildren(this.dataToTreeNodes(items, usersNode));
            this.initData(this.getRoot().getDefaultRoot().treeToList());
        });
    }

    private getUsersNodeByIdProvider(idProviderKey: IdProviderKey): TreeNode<UserTreeGridItem> {
        const idProviderNode: TreeNode<UserTreeGridItem> = this.getIdProviderNode(idProviderKey);

        if (!idProviderNode) {
            return;
        }

        return this.getUsersNodeFromIdProviderNode(idProviderNode);
    }

    private getUsersNodeFromIdProviderNode(idProviderNode: TreeNode<UserTreeGridItem>): TreeNode<UserTreeGridItem> {
        let groupsNode: TreeNode<UserTreeGridItem> = null;

        idProviderNode.getChildren().some((node: TreeNode<UserTreeGridItem>) => {
            if (!node.getData()) {
                return false;
            }

            if (node.getData().getType() === UserTreeGridItemType.USERS) {
                groupsNode = node;
                return true;
            }

            return false;
        });

        return groupsNode;
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
        return new ListUserItemsRequest().setTypes(this.searchTypes).setQuery(this.searchString).sendAndParse()
            .then((result) => {
                return result.userItems.map(item => new UserTreeGridItemBuilder().setAny(item).build());
            });
    }

    private fetchIdProvidersAndRoles(): Q.Promise<UserTreeGridItem[]> {
        return this.fetchIdProviders().then((idProviders: IdProvider[]) => {
            return this.makeIdProvidersAndRolesTreeGridItems(idProviders);
        });
    }

    private makeIdProvidersAndRolesTreeGridItems(idProviders: IdProvider[]) {
        const gridItems: UserTreeGridItem[] = [];

        gridItems.push(new UserTreeGridItemBuilder().setType(UserTreeGridItemType.ROLES).build());

        idProviders.forEach((idProvider: IdProvider) => {
            gridItems.push(
                new UserTreeGridItemBuilder().setIdProvider(idProvider).setType(UserTreeGridItemType.ID_PROVIDER).build());
        });

        return gridItems;
    }

    private fetchIdProviders(): Q.Promise<IdProvider[]> {
        return new ListIdProvidersRequest()
            .setSort('displayName ASC')
            .sendAndParse();
    }


    private fetchRoles(parentNode: TreeNode<UserTreeGridItem>): Q.Promise<UserTreeGridItem[]> {
        this.removeEmptyNode(parentNode);
        const idProviderKey: IdProviderKey = this.getIdProviderKey(parentNode);
        const from: number = parentNode.getChildren().length;
        return this.loadChildren(idProviderKey, from, [PrincipalType.ROLE]).then((newItems: UserTreeGridItem[]) => {
            const gridItems: UserTreeGridItem[] = parentNode.getChildren().map((el) => el.getData()).slice(0, from);
            gridItems.push(...newItems);
            return gridItems;
        });
    }

    private createUsersAndGroupsFolders(parentNode: TreeNode<UserTreeGridItem>): Q.Promise<UserTreeGridItem[]> {
        const idProviderNode: UserTreeGridItem = parentNode.getData();
        if (idProviderNode.isIdProvider()) {
            return Q(this.addUsersGroupsToIdProvider(idProviderNode));
        }

        return Q([]);
    }

    private addUsersGroupsToIdProvider(parentItem: UserTreeGridItem): UserTreeGridItem[] {
        const items: UserTreeGridItem[] = [];
        const idProvider: IdProvider = parentItem.getIdProvider();
        const userFolderItem: UserTreeGridItem =
            new UserTreeGridItemBuilder().setIdProvider(idProvider).setType(UserTreeGridItemType.USERS).build();
        const groupFolderItem: UserTreeGridItem =
            new UserTreeGridItemBuilder().setIdProvider(idProvider).setType(UserTreeGridItemType.GROUPS).build();
        items.push(userFolderItem);
        items.push(groupFolderItem);

        return items;
    }

    private fetchPrincipals(parentNode: TreeNode<UserTreeGridItem>): Q.Promise<UserTreeGridItem[]> {
        const folder: UserTreeGridItem = <UserTreeGridItem>parentNode.getData();
        const principalType: PrincipalType = this.getPrincipalTypeForFolderItem(folder.getType());
        this.removeEmptyNode(parentNode);
        const idProviderKey: IdProviderKey = this.getIdProviderKey(parentNode);
        const from: number = parentNode.getChildren().length;

        return this.loadChildren(idProviderKey, from, [principalType]).then((newItems: UserTreeGridItem[]) => {
            const gridItems: UserTreeGridItem[] = parentNode.getChildren().map((el) => el.getData()).slice(0, from);
            gridItems.push(...newItems);
            return gridItems;
        });
    }

    private getNodeToUpdate(node: TreeNode<UserTreeGridItem>): TreeNode<UserTreeGridItem> {
        const usersOrGroupsUpdating = node.getData().isUser() || node.getData().isUserGroup();
        const selectedData = this.getSelectedDataList()[0];
        const idProviderSelected = selectedData && selectedData.isIdProvider();

        return (usersOrGroupsUpdating && idProviderSelected) ? node.getParent() : node;
    }

    protected updateSelectedNode(node: TreeNode<UserTreeGridItem>) {
        // Highlighted nodes should remain as is, and must not be selected
        const firstSelectedOrHighlighted = this.getFirstSelectedOrHighlightedNode();
        const selected = this.getRoot().getFullSelection().length > 0;
        const highlighted = !selected && !!firstSelectedOrHighlighted;

        const nodeToUpdate = this.getNodeToUpdate(node);
        if (highlighted) {
            this.refreshNode(nodeToUpdate);
        } else if (selected) {
            super.updateSelectedNode(nodeToUpdate);
        }
    }

    getDataId(item: UserTreeGridItem): string {
        return item.getDataId();
    }

    hasChildren(item: UserTreeGridItem): boolean {
        return item.hasChildren();
    }

    private loadChildren(idProviderKey: IdProviderKey, from: number, allowedTypes: PrincipalType[],
                         itemsToLoad: number = 10): Q.Promise<UserTreeGridItem[]> {
        return new ListPrincipalsRequest()
            .setIdProviderKey(idProviderKey)
            .setTypes(allowedTypes)
            .setSort('displayName ASC')
            .setStart(from)
            .setCount(itemsToLoad)
            .sendAndParse()
            .then((result: ListPrincipalsResult) => {
                const gridItems: UserTreeGridItem[] = [];
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
            if (!child.getData().getDataId()) {
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

    refreshNodeData(parentNode: TreeNode<UserTreeGridItem>): Q.Promise<TreeNode<UserTreeGridItem>> {
        return Q(parentNode);
    }

    private getPrincipalTypeForFolderItem(itemType: UserTreeGridItemType): PrincipalType {
        if (itemType === UserTreeGridItemType.GROUPS) {
            return PrincipalType.GROUP;
        }

        if (itemType === UserTreeGridItemType.USERS) {
            return PrincipalType.USER;
        }

        throw new Error('Invalid item type for folder with principals: ' + UserTreeGridItemType[itemType]);
    }

    private isSingleItemSelected(): boolean {
        return this.getSelectedDataList().length === 1;
    }

    private isHighlightedItemIn(userTreeGridItems: UserTreeGridItem[]): boolean {
        return userTreeGridItems.some((userTreeGridItem: UserTreeGridItem) => {
            return userTreeGridItem.getDataId() === this.getFirstSelectedOrHighlightedNode().getDataId();
        });
    }

}
