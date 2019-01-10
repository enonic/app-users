import {UserTreeGridItem, UserTreeGridItemBuilder, UserTreeGridItemType} from './UserTreeGridItem';
import {UserTreeGridActions} from './UserTreeGridActions';
import {EditPrincipalEvent} from './EditPrincipalEvent';
import {UserItemsRowFormatter} from './UserItemsRowFormatter';
import {ListIdProvidersRequest} from '../../api/graphql/userStore/ListIdProvidersRequest';
import {ListPrincipalsRequest} from '../../api/graphql/principal/ListPrincipalsRequest';
import {PrincipalBrowseSearchData} from './filter/PrincipalBrowseSearchData';
import {UserItemType} from './UserItemType';
import {ListUserItemsRequest} from '../../api/graphql/principal/ListUserItemsRequest';
import {IdProvider} from '../principal/IdProvider';
import TreeGrid = api.ui.treegrid.TreeGrid;
import TreeNode = api.ui.treegrid.TreeNode;
import TreeGridBuilder = api.ui.treegrid.TreeGridBuilder;
import TreeGridContextMenu = api.ui.treegrid.TreeGridContextMenu;
import Principal = api.security.Principal;
import PrincipalType = api.security.PrincipalType;
import BrowseFilterResetEvent = api.app.browse.filter.BrowseFilterResetEvent;
import BrowseFilterSearchEvent = api.app.browse.filter.BrowseFilterSearchEvent;
import ResponsiveRanges = api.ui.responsive.ResponsiveRanges;
import UserItem = api.security.UserItem;
import i18n = api.util.i18n;
import IdProviderKey = api.security.IdProviderKey;

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
            let checkSelIsMoved = ResponsiveRanges._540_720.isFitOrSmaller(api.dom.Body.get().getEl().getWidth());

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
                let node = this.getGrid().getDataView().getItem(data.row);
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

    updateUserNode(principal: Principal, userStore: IdProvider) {
        if (!principal && !userStore) {
            return;
        }

        let userTreeGridItem;
        let builder = new UserTreeGridItemBuilder();

        if (!principal) { // IdProvider type
            userTreeGridItem = builder.setUserStore(userStore).setType(UserTreeGridItemType.USER_STORE).build();
        } else {         // Principal type
            userTreeGridItem = builder.setPrincipal(principal).setType(UserTreeGridItemType.PRINCIPAL).build();
        }

        let nodeList = this.getRoot().getCurrentRoot().treeToList();

        nodeList.forEach((node) => {
            if (node.getDataId() === userTreeGridItem.getDataId()) {
                node.setData(userTreeGridItem);
                node.clearViewers();
            }
        });

        this.initData(nodeList);
        this.invalidate();
    }

    deleteNodes(userTreeGridItemsToDelete: UserTreeGridItem[]) {
        if (this.isSingleItemSelected() && this.isHighlightedItemIn(userTreeGridItemsToDelete)) {
            this.removeHighlighting();
        }

        super.deleteNodes(userTreeGridItemsToDelete);
    }

    appendUserNode(principal: Principal, userStore: IdProvider, parentOfSameType?: boolean) {
        if (!principal) { // IdProvider type

            const userTreeGridItem = new UserTreeGridItemBuilder().setUserStore(userStore).setType(UserTreeGridItemType.USER_STORE).build();

            this.appendNode(userTreeGridItem, true, false, this.getRoot().isFiltered() ? this.getRoot().getDefaultRoot() : null);

            if (!this.getRoot().isFiltered()) {
                this.initData(this.getRoot().getDefaultRoot().treeToList());
                this.invalidate();
            }

        } else { // Principal type

            const userTreeGridItem = new UserTreeGridItemBuilder().setPrincipal(principal).setType(UserTreeGridItemType.PRINCIPAL).build();

            if (parentOfSameType) {
                this.appendNode(userTreeGridItem, parentOfSameType, false);
                return;
            }

            this.loadParentNode(principal, userStore).then((parentNode) => this.appendNodeToParent(parentNode, userTreeGridItem));
        }
    }

    fetchChildren(parentNode?: TreeNode<UserTreeGridItem>): wemQ.Promise<UserTreeGridItem[]> {
        let gridItems: UserTreeGridItem[] = [];

        parentNode = parentNode || this.getRoot().getCurrentRoot();

        let deferred = wemQ.defer<UserTreeGridItem[]>();
        let level = parentNode ? parentNode.calcLevel() : 0;

        // Creating a role with parent node pointing to another role may cause fetching to fail
        // We need to select a parent node first
        if (level !== 0 && parentNode.getData().getPrincipal() &&
            parentNode.getData().isPrincipal() &&
            parentNode.getData().getPrincipal().isRole() && !!parentNode.getParent()) {

            parentNode = parentNode.getParent();
            level--;
        }

        if (level === 0) {

            if (this.isFiltered()) {
                new ListUserItemsRequest().setTypes(this.searchTypes).setQuery(this.searchString).sendAndParse()
                    .then((result) => {
                        deferred.resolve(result.userItems.map(item => new UserTreeGridItemBuilder().setAny(item).build()));
                    })
                    .catch(api.DefaultErrorHandler.handle)
                    .done();
            } else {
                // at root level, fetch user stores, and add 'Roles' folder
                new ListIdProvidersRequest().sendAndParse()
                    .then((userStores: IdProvider[]) => {
                        userStores.forEach((userStore: IdProvider) => {
                            gridItems.push(
                                new UserTreeGridItemBuilder().setUserStore(userStore).setType(UserTreeGridItemType.USER_STORE).build());
                        });

                        gridItems.push(new UserTreeGridItemBuilder().setType(UserTreeGridItemType.ROLES).build());

                        deferred.resolve(gridItems);
                    })
                    .catch(api.DefaultErrorHandler.handle)
                    .done();
            }

        } else if (parentNode.getData().isRole()) {
            // fetch roles, if parent node 'Roles' was selected
            return this.loadChildren(parentNode, [PrincipalType.ROLE]);

        } else if (level === 1) {
            // add parent folders 'Users' and 'Groups' to the selected IdProvider
            let userStoreNode: UserTreeGridItem = parentNode.getData();
            deferred.resolve(this.addUsersGroupsToUserStore(userStoreNode));

        } else if (level === 2) {
            // fetch principals from the user store, if parent node 'Groups' or 'Users' was selected
            let folder: UserTreeGridItem = <UserTreeGridItem>parentNode.getData();
            let principalType = this.getPrincipalTypeForFolderItem(folder.getType());

            return this.loadChildren(parentNode, [principalType]);
        }
        return deferred.promise;
    }

    private getNodeToUpdate(node: TreeNode<UserTreeGridItem>): TreeNode<UserTreeGridItem> {
        const usersOrGroupsUpdating = node.getData().isUser() || node.getData().isUserGroup();
        const selectedData = this.getSelectedDataList()[0];
        const userStoreSelected = selectedData && selectedData.isUserStore();

        return (usersOrGroupsUpdating && userStoreSelected) ? node.getParent() : node;
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

    private loadParentNode(principal: Principal, userStore: IdProvider): wemQ.Promise<TreeNode<UserTreeGridItem>> {
        const rootNode = this.getRoot().getCurrentRoot();

        if (principal.isRole()) {

            const rolesNode = rootNode.getChildren()
                .filter(node => node.getData() && node.getData().getType() === UserTreeGridItemType.ROLES)[0];

            if (rolesNode) {
                return this.fetchDataAndSetNodes(rolesNode).then(() => rolesNode);
            }
        } else {
            const userStoreId = userStore.getKey().getId();
            const userStoreNode = rootNode.getChildren().filter(node => node.getDataId() === userStoreId)[0] || rootNode;

            return this.fetchDataAndSetNodes(userStoreNode).then(() => {
                const parentItemType = UserTreeGridItem.getParentType(principal);

                const parentNode = userStoreNode.getChildren().filter(node => node.getData().getType() === parentItemType)[0];

                return this.fetchDataAndSetNodes(parentNode).then(() => parentNode);
            });
        }
    }

    private loadChildren(parentNode: TreeNode<UserTreeGridItem>, allowedTypes: PrincipalType[]): wemQ.Promise<UserTreeGridItem[]> {

        let deferred = wemQ.defer<UserTreeGridItem[]>();

        let from = parentNode.getChildren().length;
        if (from > 0 && !parentNode.getChildren()[from - 1].getData().getDataId()) {
            parentNode.getChildren().pop();
            from--;
        }

        let gridItems: UserTreeGridItem[] = parentNode.getChildren().map((el) => {
            return el.getData();
        }).slice(0, from);

        let userStoreNode: UserTreeGridItem = null;
        let userStoreKey: IdProviderKey = null;
        // fetch principals from the user store, if parent node 'Groups' or 'Users' was selected
        if (!parentNode.getData().isRole()) {
            userStoreNode = parentNode.getParent().getData();
            userStoreKey = userStoreNode.getUserStore().getKey();
        }

        new ListPrincipalsRequest()
            .setUserStoreKey(userStoreKey)
            .setTypes(allowedTypes)
            .setStart(from)
            .setCount(10)
            .sendAndParse()
            .then(
                (result) => {
                    let principals = result.principals;

                    principals.forEach((principal: Principal) => {
                        gridItems.push(
                            new UserTreeGridItemBuilder().setPrincipal(principal).setType(UserTreeGridItemType.PRINCIPAL).build());
                    });

                    if (from + principals.length < result.total) {
                        gridItems.push(UserTreeGridItem.create().build());
                    }

                    deferred.resolve(gridItems);
                }).catch((reason: any) => {
            api.DefaultErrorHandler.handle(reason);
        }).done();

        return deferred.promise;
    }

    refreshNodeData(parentNode: TreeNode<UserTreeGridItem>): wemQ.Promise<TreeNode<UserTreeGridItem>> {
        let deferred = Q.defer<TreeNode<UserTreeGridItem>>();
        deferred.resolve(parentNode);

        return deferred.promise;
    }

    private getPrincipalTypeForFolderItem(itemType: UserTreeGridItemType): PrincipalType {
        if (itemType === UserTreeGridItemType.GROUPS) {
            return PrincipalType.GROUP;
        } else if (itemType === UserTreeGridItemType.USERS) {
            return PrincipalType.USER;
        } else {
            throw new Error('Invalid item type for folder with principals: ' + UserTreeGridItemType[itemType]);
        }
    }

    private addUsersGroupsToUserStore(parentItem: UserTreeGridItem): UserTreeGridItem[] {
        let items: UserTreeGridItem[] = [];
        if (parentItem.isUserStore()) {
            let userStore = parentItem.getUserStore();
            let userFolderItem = new UserTreeGridItemBuilder().setUserStore(userStore).setType(UserTreeGridItemType.USERS).build();
            let groupFolderItem = new UserTreeGridItemBuilder().setUserStore(userStore).setType(UserTreeGridItemType.GROUPS).build();
            items.push(userFolderItem);
            items.push(groupFolderItem);
        }
        return items;
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
