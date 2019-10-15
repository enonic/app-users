import * as Q from 'q';
import {UserTreeGridItem, UserTreeGridItemBuilder, UserTreeGridItemType} from './UserTreeGridItem';
import {UserTreeGridActions} from './UserTreeGridActions';
import {EditPrincipalEvent} from './EditPrincipalEvent';
import {UserItemsRowFormatter} from './UserItemsRowFormatter';
import {ListIdProvidersRequest} from '../../graphql/idprovider/ListIdProvidersRequest';
import {ListPrincipalsRequest} from '../../graphql/principal/ListPrincipalsRequest';
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
import {i18n} from 'lib-admin-ui/util/Messages';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {Body} from 'lib-admin-ui/dom/Body';

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

    updateUserNode(principal: Principal, idProvider: IdProvider) {
        if (!principal && !idProvider) {
            return;
        }

        let userTreeGridItem;
        let builder = new UserTreeGridItemBuilder();

        if (!principal) { // IdProvider type
            userTreeGridItem = builder.setIdProvider(idProvider).setType(UserTreeGridItemType.ID_PROVIDER).build();
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

    appendUserNode(principal: Principal, idProvider: IdProvider, parentOfSameType?: boolean) {
        if (!principal) { // IdProvider type

            const userTreeGridItem = new UserTreeGridItemBuilder().setIdProvider(idProvider).setType(
                UserTreeGridItemType.ID_PROVIDER).build();

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

            this.loadParentNode(principal, idProvider).then((parentNode) => this.appendNodeToParent(parentNode, userTreeGridItem));
        }
    }

    fetchChildren(parentNode?: TreeNode<UserTreeGridItem>): Q.Promise<UserTreeGridItem[]> {
        let gridItems: UserTreeGridItem[] = [];

        parentNode = parentNode || this.getRoot().getCurrentRoot();

        let deferred = Q.defer<UserTreeGridItem[]>();
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
                    .catch(DefaultErrorHandler.handle)
                    .done();
            } else {
                // at root level, fetch id providers, and add 'Roles' folder
                new ListIdProvidersRequest().sendAndParse()
                    .then((idProviders: IdProvider[]) => {
                        idProviders.forEach((idProvider: IdProvider) => {
                            gridItems.push(
                                new UserTreeGridItemBuilder().setIdProvider(idProvider).setType(UserTreeGridItemType.ID_PROVIDER).build());
                        });

                        gridItems.push(new UserTreeGridItemBuilder().setType(UserTreeGridItemType.ROLES).build());

                        deferred.resolve(gridItems);
                    })
                    .catch(DefaultErrorHandler.handle)
                    .done();
            }

        } else if (parentNode.getData().isRole()) {
            // fetch roles, if parent node 'Roles' was selected
            return this.loadChildren(parentNode, [PrincipalType.ROLE]);

        } else if (level === 1) {
            // add parent folders 'Users' and 'Groups' to the selected IdProvider
            let idProviderNode: UserTreeGridItem = parentNode.getData();
            deferred.resolve(this.addUsersGroupsToIdProvider(idProviderNode));

        } else if (level === 2) {
            // fetch principals from the id provider, if parent node 'Groups' or 'Users' was selected
            let folder: UserTreeGridItem = <UserTreeGridItem>parentNode.getData();
            let principalType = this.getPrincipalTypeForFolderItem(folder.getType());

            return this.loadChildren(parentNode, [principalType]);
        }
        return deferred.promise;
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

    private loadParentNode(principal: Principal, idProvider: IdProvider): Q.Promise<TreeNode<UserTreeGridItem>> {
        const rootNode = this.isFiltered() ? this.getRoot().getFilteredRoot() : this.getRoot().getCurrentRoot();

        if (principal.isRole()) {

            const rolesNode = rootNode.getChildren()
                .filter(node => node.getData() && node.getData().getType() === UserTreeGridItemType.ROLES)[0];

            return rolesNode ? this.fetchDataAndSetNodes(rolesNode).then(() => rolesNode) : Q(null);
        } else {
            const idProviderId = idProvider.getKey().getId();
            const idProviderNode = rootNode.getChildren().filter(node => node.getDataId() === idProviderId)[0] || rootNode;

            return this.fetchDataAndSetNodes(idProviderNode).then(() => {
                const parentItemType = UserTreeGridItem.getParentType(principal);

                const parentNode = idProviderNode.getChildren().filter(node => node.getData().getType() === parentItemType)[0];

                return this.fetchDataAndSetNodes(parentNode).then(() => parentNode);
            });
        }
    }

    private loadChildren(parentNode: TreeNode<UserTreeGridItem>, allowedTypes: PrincipalType[]): Q.Promise<UserTreeGridItem[]> {

        let deferred = Q.defer<UserTreeGridItem[]>();

        let from = parentNode.getChildren().length;
        if (from > 0 && !parentNode.getChildren()[from - 1].getData().getDataId()) {
            parentNode.getChildren().pop();
            from--;
        }

        let gridItems: UserTreeGridItem[] = parentNode.getChildren().map((el) => {
            return el.getData();
        }).slice(0, from);

        let idProviderNode: UserTreeGridItem = null;
        let idProviderKey: IdProviderKey = null;
        // fetch principals from the id provider, if parent node 'Groups' or 'Users' was selected
        if (!parentNode.getData().isRole()) {
            idProviderNode = parentNode.getParent().getData();
            idProviderKey = idProviderNode.getIdProvider().getKey();
        }

        new ListPrincipalsRequest()
            .setIdProviderKey(idProviderKey)
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
            DefaultErrorHandler.handle(reason);
        }).done();

        return deferred.promise;
    }

    refreshNodeData(parentNode: TreeNode<UserTreeGridItem>): Q.Promise<TreeNode<UserTreeGridItem>> {
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

    private addUsersGroupsToIdProvider(parentItem: UserTreeGridItem): UserTreeGridItem[] {
        let items: UserTreeGridItem[] = [];
        if (parentItem.isIdProvider()) {
            let idProvider = parentItem.getIdProvider();
            let userFolderItem = new UserTreeGridItemBuilder().setIdProvider(idProvider).setType(UserTreeGridItemType.USERS).build();
            let groupFolderItem = new UserTreeGridItemBuilder().setIdProvider(idProvider).setType(UserTreeGridItemType.GROUPS).build();
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
