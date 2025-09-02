import Q from 'q';
import {UserTreeGridItem, UserTreeGridItemType} from './UserTreeGridItem';
import {SyncPrincipalAction} from './action/SyncPrincipalAction';
import {DeletePrincipalAction} from './action/DeletePrincipalAction';
import {EditPrincipalAction} from './action/EditPrincipalAction';
import {NewPrincipalAction} from './action/NewPrincipalAction';
import {User} from '../principal/User';
import {IdProvider} from '../principal/IdProvider';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {TreeGridActions} from '@enonic/lib-admin-ui/ui/treegrid/actions/TreeGridActions';
import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {SelectableListBoxWrapper} from '@enonic/lib-admin-ui/ui/selector/list/SelectableListBoxWrapper';

export class UserTreeGridActions implements TreeGridActions<UserTreeGridItem> {

    public NEW: Action;
    public EDIT: Action;
    public DELETE: Action;
    public SYNC: Action;

    private actions: Action[] = [];

    constructor(selectionWrapper: SelectableListBoxWrapper<UserTreeGridItem>) {
        this.NEW = new NewPrincipalAction(selectionWrapper);
        this.EDIT = new EditPrincipalAction(selectionWrapper);
        this.DELETE = new DeletePrincipalAction(selectionWrapper);
        this.SYNC = new SyncPrincipalAction(selectionWrapper);

        this.NEW.setEnabled(true);
        this.actions.push(this.NEW, this.EDIT, this.DELETE/*, this.SYNC*/);
    }

    getAllActions(): Action[] {
        return this.actions;
    }

    updateActionsEnabledState(items: UserTreeGridItem[]): Q.Promise<void> {
        return Q(true).then(() => {
            let idProvidersSelected: number = 0;
            let principalsSelected: number = 0;
            let directoriesSelected: number = 0;
            let usersSelected: number = 0;

            items.forEach((item: UserTreeGridItem) => {
                const itemType: UserTreeGridItemType = item.getType();
                switch (itemType) {
                case UserTreeGridItemType.PRINCIPAL:
                    principalsSelected++;
                    if (ObjectHelper.iFrameSafeInstanceOf(item.getPrincipal(), User)) {
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

            if (this.isSystemUserItemSelected(items)) {
                this.DELETE.setEnabled(false);
            } else if (onlyUsersSelected || onePrincipalSelected) {
                this.DELETE.setEnabled(true);
            } else if (totalSelection === 1) {
                this.establishDeleteActionState(items[0]);
            } else {
                this.DELETE.setEnabled(false);
            }

            this.SYNC.setEnabled(anyIdProvider);
        });
    }

    private isSystemUserItemSelected(items: UserTreeGridItem[]) {
        const principals: Principal[] = items
            .filter((item: UserTreeGridItem) => item.isPrincipal())
            .map((item: UserTreeGridItem) => item.getPrincipal());

        return principals.some(principal => principal.isSystem());
    }

    private establishDeleteActionState(userBrowseItem: UserTreeGridItem) {
        if (this.itemTypeAllowsDeletion(userBrowseItem.getType()) && userBrowseItem.getIdProvider() &&
            userBrowseItem.getIdProvider().getKey()) {
            IdProvider.checkOnDeletable(userBrowseItem.getIdProvider().getKey()).then((result: boolean) => {
                this.DELETE.setEnabled(result);
            }).catch(DefaultErrorHandler.handle).done();
        } else {
            this.DELETE.setEnabled(false);
        }
    }

    private itemTypeAllowsDeletion(userTreeGridItemType: UserTreeGridItemType): boolean {
        return (userTreeGridItemType !== UserTreeGridItemType.USERS && userTreeGridItemType !== UserTreeGridItemType.GROUPS);
    }
}
