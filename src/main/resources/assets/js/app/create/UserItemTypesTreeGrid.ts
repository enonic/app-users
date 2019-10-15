import * as Q from 'q';
import {UserTypeTreeGridItem, UserTypeTreeGridItemBuilder} from './UserTypeTreeGridItem';
import {UserItemTypesRowFormatter} from './UserItemTypesRowFormatter';
import {NewPrincipalEvent} from '../browse/NewPrincipalEvent';
import {UserTreeGridItemBuilder, UserTreeGridItemType} from '../browse/UserTreeGridItem';
import {ListIdProvidersRequest} from '../../graphql/idprovider/ListIdProvidersRequest';
import {IdProvider, IdProviderBuilder} from '../principal/IdProvider';
import {User, UserBuilder} from '../principal/User';
import {Group, GroupBuilder} from '../principal/Group';
import {Role, RoleBuilder} from '../principal/Role';
import {TreeGrid} from 'lib-admin-ui/ui/treegrid/TreeGrid';
import {TreeNode} from 'lib-admin-ui/ui/treegrid/TreeNode';
import {TreeGridBuilder} from 'lib-admin-ui/ui/treegrid/TreeGridBuilder';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {PrincipalType} from 'lib-admin-ui/security/PrincipalType';
import {ResponsiveManager} from 'lib-admin-ui/ui/responsive/ResponsiveManager';
import {IsAuthenticatedRequest} from 'lib-admin-ui/security/auth/IsAuthenticatedRequest';
import {IdProviderKey} from 'lib-admin-ui/security/IdProviderKey';
import {i18n} from 'lib-admin-ui/util/Messages';
import {DefaultErrorHandler} from 'lib-admin-ui/DefaultErrorHandler';
import {LoginResult} from 'lib-admin-ui/security/auth/LoginResult';

export class UserItemTypesTreeGrid extends TreeGrid<UserTypeTreeGridItem> {

    private idProviders: IdProvider[];

    private manualidProvider: boolean;

    constructor() {
        const builder = new TreeGridBuilder<UserTypeTreeGridItem>().setColumnConfig([{
            name: i18n('field.name'),
            id: 'name',
            field: 'displayName',
            formatter: UserItemTypesRowFormatter.nameFormatter,
            style: {}
        }]).setPartialLoadEnabled(false)
            .setShowToolbar(false)
            .disableMultipleSelection(true)
            .setCheckableRows(false)
            .setToggleClickEnabled(false)
            .prependClasses('user-types-tree-grid');

        super(builder);

        this.manualidProvider = false;

        this.initEventHandlers();
    }

    fetchidProviders(): Q.Promise<IdProvider[]> {
        if (this.idProviders) {
            return Q.resolve(this.idProviders);
        }

        return new ListIdProvidersRequest().sendAndParse().then((idProviders: IdProvider[]) => {
            this.idProviders = idProviders;
            this.toggleClass('flat', this.idProviders.length === 1);
            return idProviders;
        });
    }

    fetchRoot(): Q.Promise<UserTypeTreeGridItem[]> {
        return Q.spread<any, any>(
            [new IsAuthenticatedRequest().sendAndParse(), this.fetchidProviders()],
            (result: LoginResult) => result.isUserAdmin(),
            reason => {
                DefaultErrorHandler.handle(reason);
                return false;
            }
        ).then(userIsAdmin => [
            new UserTypeTreeGridItemBuilder()
                .setUserItem(new UserBuilder()
                    .setKey(new PrincipalKey(IdProviderKey.SYSTEM, PrincipalType.USER, 'user'))
                    .setDisplayName(i18n('field.user'))
                    .build()).build(),
            new UserTypeTreeGridItemBuilder()
                .setUserItem(new GroupBuilder()
                    .setKey(new PrincipalKey(IdProviderKey.SYSTEM, PrincipalType.GROUP, 'user-group'))
                    .setDisplayName(i18n('field.userGroup'))
                    .build()).build(),
            ...((this.manualidProvider || !userIsAdmin) ? [] : [
                new UserTypeTreeGridItemBuilder()
                    .setUserItem(new IdProviderBuilder()
                        .setKey(IdProviderKey.SYSTEM.toString())
                        .setDisplayName(i18n('field.idProvider'))
                        .build()).build(),
                new UserTypeTreeGridItemBuilder()
                    .setUserItem(new RoleBuilder()
                        .setKey(new PrincipalKey(IdProviderKey.SYSTEM, PrincipalType.ROLE, 'role'))
                        .setDisplayName(i18n('field.role'))
                        .build()).build(),
            ])
        ]);
    }

    getDataId(data: UserTypeTreeGridItem): string {
        return data.getId();
    }

    hasChildren(item: UserTypeTreeGridItem): boolean {
        return item.hasChildren();
    }

    fetchChildren(parentNode: TreeNode<UserTypeTreeGridItem>): Q.Promise<UserTypeTreeGridItem[]> {

        return this.fetchidProviders().then((idProviders: IdProvider[]) => {
            if (idProviders.length > 1) {
                return idProviders.map((idProvider: IdProvider) => new UserTypeTreeGridItemBuilder()
                    .setUserItem(new IdProviderBuilder()
                        .setKey(idProvider.getKey().toString())
                        .setDisplayName(idProvider.getDisplayName())
                        .build()).build());
            } else if (idProviders.length === 1) {
                const userItem = parentNode.getData().getUserItem();
                if (userItem instanceof User) {
                    const item = new UserTreeGridItemBuilder().setIdProvider(idProviders[0]).setType(UserTreeGridItemType.USERS).build();
                    new NewPrincipalEvent([item]).fire();
                } else if (userItem instanceof Group) {
                    const item = new UserTreeGridItemBuilder().setIdProvider(idProviders[0]).setType(UserTreeGridItemType.GROUPS).build();
                    new NewPrincipalEvent([item]).fire();
                }
            }
            return [];
        });
    }

    setIdProvider(idProvider: IdProvider) {
        this.idProviders = [idProvider];
        this.manualidProvider = true;
        this.addClass('flat');
    }

    clearidProviders() {
        this.idProviders = null;
        this.manualidProvider = false;
        this.removeClass('flat');
    }

    private initEventHandlers() {
        this.getGrid().subscribeOnClick((event, data) => {
            event.preventDefault();
            event.stopPropagation();

            const node = this.getGrid().getDataView().getItem(data.row);
            const userItem = node.getData().getUserItem();
            if (node.getData().hasChildren()) {
                this.toggleNode(node);
                ResponsiveManager.fireResizeEvent();
            } else {
                const isRootNode = node.calcLevel() === 1;
                if (userItem instanceof IdProvider) {
                    if (isRootNode) {
                        new NewPrincipalEvent([new UserTreeGridItemBuilder().setType(UserTreeGridItemType.ID_PROVIDER).build()]).fire();
                    } else if (node.getParent().getData().getUserItem() instanceof User) {
                        const item = new UserTreeGridItemBuilder().setIdProvider(userItem).setType(UserTreeGridItemType.USERS).build();
                        new NewPrincipalEvent([item]).fire();
                    } else if (node.getParent().getData().getUserItem() instanceof Group) {
                        const item = new UserTreeGridItemBuilder().setIdProvider(userItem).setType(UserTreeGridItemType.GROUPS).build();
                        new NewPrincipalEvent([item]).fire();
                    }
                } else if (userItem instanceof Role) {
                    new NewPrincipalEvent([new UserTreeGridItemBuilder().setType(UserTreeGridItemType.ROLES).build()]).fire();
                }
            }
        });
    }
}
