import {UserTreeGridItem, UserTreeGridItemType} from './UserTreeGridItem';
import {SyncPrincipalAction} from './action/SyncPrincipalAction';
import {DeletePrincipalAction} from './action/DeletePrincipalAction';
import {EditPrincipalAction} from './action/EditPrincipalAction';
import {NewPrincipalAction} from './action/NewPrincipalAction';
import {UserItemsTreeGrid} from './UserItemsTreeGrid';
import {User} from '../principal/User';
import {IdProvider} from '../principal/IdProvider';
import Action = api.ui.Action;
import TreeGridActions = api.ui.treegrid.actions.TreeGridActions;
import BrowseItem = api.app.browse.BrowseItem;
import BrowseItemsChanges = api.app.browse.BrowseItemsChanges;
import Principal = api.security.Principal;

export class UserTreeGridActions implements TreeGridActions<UserTreeGridItem> {

    public NEW: Action;
    public EDIT: Action;
    public DELETE: Action;
    public SYNC: Action;

    private actions: api.ui.Action[] = [];

    constructor(grid: UserItemsTreeGrid) {
        this.NEW = new NewPrincipalAction(grid);
        this.EDIT = new EditPrincipalAction(grid);
        this.DELETE = new DeletePrincipalAction(grid);
        this.SYNC = new SyncPrincipalAction(grid);

        this.NEW.setEnabled(true);
        this.actions.push(this.NEW, this.EDIT, this.DELETE/*, this.SYNC*/);
    }

    getAllActions(): api.ui.Action[] {
        return this.actions;
    }

    updateActionsEnabledState(browseItems: BrowseItem<UserTreeGridItem>[],
                              changes?: BrowseItemsChanges<UserTreeGridItem>): wemQ.Promise<void> {
        return wemQ(true).then(() => {
            let idProvidersSelected: number = 0;
            let principalsSelected: number = 0;
            let directoriesSelected: number = 0;
            let usersSelected: number = 0;

            browseItems.forEach((browseItem: BrowseItem<UserTreeGridItem>) => {
                const item = <UserTreeGridItem>browseItem.getModel();
                const itemType = item.getType();
                switch (itemType) {
                case UserTreeGridItemType.PRINCIPAL:
                    principalsSelected++;
                    if (api.ObjectHelper.iFrameSafeInstanceOf(item.getPrincipal(), User)) {
                        usersSelected++;
                    }
                    break;
                case UserTreeGridItemType.ROLES:
                    directoriesSelected++;
                    break;
                case UserTreeGridItemType.GROUPS:
                    directoriesSelected++;
                    break;
                case UserTreeGridItemType.USERS:
                    directoriesSelected++;
                    break;
                case UserTreeGridItemType.ID_PROVIDER:
                    idProvidersSelected++;
                    break;
                }
            });

            const totalSelection = idProvidersSelected + principalsSelected + directoriesSelected;
            const anyPrincipal = principalsSelected > 0;
            const anyIdProvider = idProvidersSelected > 0;
            const onlyUsersSelected = totalSelection >= 1 && totalSelection === usersSelected;
            const onePrincipalSelected = totalSelection === 1 && totalSelection === principalsSelected;

            this.EDIT.setEnabled(directoriesSelected < 1 && (anyIdProvider || anyPrincipal));

            if (this.isSystemUserSelected(browseItems)) {
                this.DELETE.setEnabled(false);
            } else if (onlyUsersSelected || onePrincipalSelected) {
                this.DELETE.setEnabled(true);
            } else if (totalSelection === 1) {
                this.establishDeleteActionState((<BrowseItem<UserTreeGridItem>>browseItems[0]).getModel());
            } else {
                this.DELETE.setEnabled(false);
            }

            this.SYNC.setEnabled(anyIdProvider);
        });
    }

    private isSystemUserSelected(browseItems: BrowseItem<UserTreeGridItem>[]) {
        const users: Principal[] = browseItems
            .filter(item => (<BrowseItem<UserTreeGridItem>>item).getModel().isPrincipal())
            .map(item => (<BrowseItem<UserTreeGridItem>>item).getModel().getPrincipal());

        return users.some(user => user.isSystemUser());
    }

    private establishDeleteActionState(userBrowseItem: UserTreeGridItem) {
        if (this.itemTypeAllowsDeletion(userBrowseItem.getType()) && userBrowseItem.getIdProvider() &&
            userBrowseItem.getIdProvider().getKey()) {
            IdProvider.checkOnDeletable(userBrowseItem.getIdProvider().getKey()).then((result: boolean) => {
                this.DELETE.setEnabled(result);
            }).catch(api.DefaultErrorHandler.handle).done();
        } else {
            this.DELETE.setEnabled(false);
        }
    }

    private itemTypeAllowsDeletion(userTreeGridItemType: UserTreeGridItemType): boolean {
        return (userTreeGridItemType !== UserTreeGridItemType.USERS && userTreeGridItemType !== UserTreeGridItemType.GROUPS);
    }
}
