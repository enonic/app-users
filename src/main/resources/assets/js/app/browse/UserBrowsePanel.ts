import {UserItemsTreeGrid} from './UserItemsTreeGrid';
import {UserBrowseToolbar} from './UserBrowseToolbar';
import {UserTreeGridItem, UserTreeGridItemBuilder, UserTreeGridItemType} from './UserTreeGridItem';
import {UserBrowseItemPanel} from './UserBrowseItemPanel';
import {PrincipalBrowseFilterPanel} from './filter/PrincipalBrowseFilterPanel';
import {Router} from '../Router';
import {PrincipalServerEventsHandler} from '../event/PrincipalServerEventsHandler';
import {IdProvider} from '../principal/IdProvider';
import {PrincipalType} from '@enonic/lib-admin-ui/security/PrincipalType';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {BrowsePanel} from '@enonic/lib-admin-ui/app/browse/BrowsePanel';
import {AppHelper} from '@enonic/lib-admin-ui/util/AppHelper';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {SelectableListBoxPanel} from '@enonic/lib-admin-ui/ui/panel/SelectableListBoxPanel';
import {TreeGridContextMenu} from '@enonic/lib-admin-ui/ui/treegrid/TreeGridContextMenu';
import {ListBoxToolbar} from '@enonic/lib-admin-ui/ui/selector/list/ListBoxToolbar';
import {UserTreeGridActions} from './UserTreeGridActions';
import {SelectableListBoxWrapper} from '@enonic/lib-admin-ui/ui/selector/list/SelectableListBoxWrapper';
import {SelectableTreeListBoxKeyNavigator} from '@enonic/lib-admin-ui/ui/selector/list/SelectableTreeListBoxKeyNavigator';
import {BrowseFilterSearchEvent} from '@enonic/lib-admin-ui/app/browse/filter/BrowseFilterSearchEvent';
import {PrincipalBrowseSearchData} from './filter/PrincipalBrowseSearchData';
import {BrowseFilterResetEvent} from '@enonic/lib-admin-ui/app/browse/filter/BrowseFilterResetEvent';
import {UserItemsTreeRootList} from './UserItemsTreeRootList';
import {UserItemsTreeList, UserItemsTreeListElement} from './UserItemsTreeList';
import {EditPrincipalEvent} from './EditPrincipalEvent';
import {TreeGridActions} from '@enonic/lib-admin-ui/ui/treegrid/actions/TreeGridActions';
import {ViewItem} from '@enonic/lib-admin-ui/app/view/ViewItem';

export class UserBrowsePanel
    extends BrowsePanel {

    protected treeListBox: UserItemsTreeRootList;

    protected selectionWrapper: SelectableListBoxWrapper<UserTreeGridItem>;

    protected toolbar: ListBoxToolbar<UserTreeGridItem>;

    protected treeActions: UserTreeGridActions;

    protected contextMenu: TreeGridContextMenu;

    constructor() {
        super();

        this.addClass('user-browse-panel');
        this.bindServerEventListeners();

        this.onShown(() => {
            Router.setHash('browse');
        });
    }

    private bindServerEventListeners() {
        const serverHandler = PrincipalServerEventsHandler.getInstance();

        serverHandler.onUserItemCreated((principal: Principal, idProvider: IdProvider) => {
            this.appendUserItemNode(principal, idProvider);
            this.setRefreshOfFilterRequired();

            /*
                In case you switch to UserBrowsePanel before this event occured you need to trigger refresh manually
                Otherwise 'shown' event won't update filter
             */
            if (this.isVisible()) {
                this.refreshFilter();
            }

            if (this.selectionWrapper.getSelectedItems().length > 0) {
                this.updateBrowseActions();
            }
        });

        serverHandler.onUserItemUpdated((principal: Principal, idProvider: IdProvider) => {
            let userTreeGridItem: UserTreeGridItem;
            const builder: UserTreeGridItemBuilder = new UserTreeGridItemBuilder();

            if (!principal) { // IdProvider type
                userTreeGridItem = builder.setIdProvider(idProvider).setType(UserTreeGridItemType.ID_PROVIDER).build();
            } else {         // Principal type
                userTreeGridItem = builder.setPrincipal(principal).setIdProvider(idProvider).setType(UserTreeGridItemType.PRINCIPAL).build();
            }

            this.findParentList(userTreeGridItem)?.replaceItems(userTreeGridItem);
        });

        serverHandler.onUserItemDeleted((ids: string[]) => {
            this.setRefreshOfFilterRequired();

            ids.forEach((id: string) => {
                const item = this.treeListBox.getItem(id);

                if (item) {
                    this.findParentList(item)?.removeItems(item);
                }
            });

            this.refreshFilter();
        });
    }

    private appendUserItemNode(principal: Principal, idProvider: IdProvider): void {
        if (!principal) {
            this.appendIdProvider(idProvider);
        } else {
            this.appendPrincipal(principal, idProvider);
        }
    }

    private appendIdProvider(idProvider: IdProvider) {
        const idProviderItem = new UserTreeGridItemBuilder().setIdProvider(idProvider).setType(
            UserTreeGridItemType.ID_PROVIDER).build();

        this.treeListBox.addItems(idProviderItem);
    }

    private appendPrincipal(principal: Principal, idProvider: IdProvider) {
        const userTreeGridItem: UserTreeGridItem = new UserTreeGridItemBuilder().setIdProvider(idProvider).setPrincipal(principal).setType(
            UserTreeGridItemType.PRINCIPAL).build();
        const parentList = this.findParentList(userTreeGridItem);

        if (parentList.wasAlreadyShownAndLoaded()) {
            parentList.addItems(userTreeGridItem, false, 0);
        } else {
            const p = parentList.getParentItem();

            if (!p.hasChildrenItems()) {
                p.setChildren(true);
                parentList.getParentList().replaceItems(p);
            }
        }
    }

    private findParentList(item: UserTreeGridItem): UserItemsTreeList {
        if (item.isIdProvider()) {
            return this.treeListBox;
        }

        if (item.isPrincipal()) {
            if (item.getPrincipal().isRole()) {
                const listElement = this.treeListBox.getItemViews().find(
                    (view: UserItemsTreeListElement) => view.getItem().isRole()) as UserItemsTreeListElement;
                return listElement.getList() as UserItemsTreeList;
            }

            if (item.getPrincipal().isGroup() || item.getPrincipal().isUser()) {
                const idProviderKey = item.getIdProvider().getKey().toString();
                const idProviderListElement = this.treeListBox.getItemViews().find(
                    (view: UserItemsTreeListElement) => view.getItem().getId() === idProviderKey) as UserItemsTreeListElement;
                const idProviderList = idProviderListElement?.getList() as UserItemsTreeList;

                const typeToLook = item.getPrincipal().isUser() ? UserTreeGridItemType.USERS : UserTreeGridItemType.GROUPS;
                const usersOrGroupsListElement = idProviderList?.getItemViews().find(
                    (view: UserItemsTreeListElement) => view.getItem().getType() === typeToLook) as UserItemsTreeListElement;

                return usersOrGroupsListElement?.getList() as UserItemsTreeList;
            }
        }

        return null;
    }

    protected initListeners(): void {
        super.initListeners();

        this.treeListBox.onItemsAdded((items: UserTreeGridItem[]) => {
            items.forEach((item: UserTreeGridItem) => {
                const listElement = this.treeListBox.getDataView(item) as UserItemsTreeListElement;

                listElement?.onDblClicked(() => {
                    if (item.isIdProvider() || item.isPrincipal()) {
                        new EditPrincipalEvent([item]).fire();
                    }
                });

                listElement?.onContextMenu((event: MouseEvent) => {
                    event.preventDefault();
                    this.contextMenu.showAt(event.clientX, event.clientY);
                });
            });
        });

        BrowseFilterSearchEvent.on((event: BrowseFilterSearchEvent<PrincipalBrowseSearchData>) => {
            const data = event.getData();
            this.treeListBox.setSearchString(data.getSearchString()).setSearchTypes(data.getTypes()).load();
        });

        BrowseFilterResetEvent.on(() => {
            this.treeListBox.resetFilter();
        });

        this.initSelectionListeners();
    }

    protected createToolbar(): UserBrowseToolbar {
        return new UserBrowseToolbar(this.treeActions);
    }

    protected getBrowseActions(): TreeGridActions<ViewItem> {
        return this.treeActions;
    }

    protected createTreeGrid(): UserItemsTreeGrid {
        return new UserItemsTreeGrid();
    }

    protected createListBoxPanel(): SelectableListBoxPanel<UserTreeGridItem> {
        this.treeListBox = new UserItemsTreeRootList({scrollParent: this});

        this.selectionWrapper = new SelectableListBoxWrapper<UserTreeGridItem>(this.treeListBox, {
            className: 'user-list-box-wrapper',
            maxSelected: 0,
            checkboxPosition: 'left',
            highlightMode: true,
        });

        this.treeActions = new UserTreeGridActions(this.selectionWrapper);
        this.contextMenu = new TreeGridContextMenu(this.treeActions);
        this.toolbar = new ListBoxToolbar<UserTreeGridItem>(this.selectionWrapper, {
            refreshAction: () => void this.treeListBox.load(),
        });

        new SelectableTreeListBoxKeyNavigator(this.selectionWrapper);

        this.toolbar.getSelectionPanelToggler().hide();

        return new SelectableListBoxPanel(this.selectionWrapper, this.toolbar);
    }

    private initSelectionListeners(): void {
        const changeSelectionStatus = AppHelper.debounce((selection: UserTreeGridItem[]) => {
            const singleSelection = selection.length === 1;
            const newAction = this.treeActions.NEW;

            let label;

            if (singleSelection && selection[0].getType() !== UserTreeGridItemType.ID_PROVIDER) {
                const userItem: UserTreeGridItem = selection[0];

                switch (userItem.getType()) {
                case UserTreeGridItemType.USERS:
                    label = i18n('action.new.user');
                    break;
                case UserTreeGridItemType.GROUPS:
                    label = i18n('action.new.group');
                    break;
                case UserTreeGridItemType.ROLES:
                    label = i18n('action.new.role');
                    break;
                case UserTreeGridItemType.PRINCIPAL:
                    label = i18n(`action.new.${PrincipalType[userItem.getPrincipal().getType()].toLowerCase()}`);
                    break;
                default:
                    label = i18n('action.new.more');
                }
            } else {
                label = i18n('action.new.more');
            }
            newAction.setLabel(label);
        }, 10);

        this.selectionWrapper.onSelectionChanged(() => changeSelectionStatus(this.selectionWrapper.getSelectedItems()));
    }

    protected createBrowseItemPanel(): UserBrowseItemPanel {
        return new UserBrowseItemPanel();
    }

    protected createFilterPanel(): PrincipalBrowseFilterPanel {
        return new PrincipalBrowseFilterPanel();
    }

    protected enableSelectionMode(): void {
        this.filterPanel.setSelectedItems(this.selectionWrapper.getSelectedItems().map(item => item.getId()));
    }

    protected disableSelectionMode(): void {
        this.filterPanel.resetConstraints();
        this.hideFilterPanel();
        super.disableSelectionMode();
        this.treeListBox.resetFilter();
    }
}
