import * as Q from 'q';
import {UserTypeTreeGridItem, UserTypeTreeGridItemBuilder} from './UserTypeTreeGridItem';
import {UserItemTypesRowFormatter} from './UserItemTypesRowFormatter';
import {NewPrincipalEvent} from '../browse/NewPrincipalEvent';
import {UserTreeGridItem, UserTreeGridItemBuilder, UserTreeGridItemType} from '../browse/UserTreeGridItem';
import {ListIdProvidersRequest} from '../../graphql/idprovider/ListIdProvidersRequest';
import {IdProvider, IdProviderBuilder} from '../principal/IdProvider';
import {User, UserBuilder} from '../principal/User';
import {Group, GroupBuilder} from '../principal/Group';
import {Role, RoleBuilder} from '../principal/Role';
import {TreeGrid} from '@enonic/lib-admin-ui/ui/treegrid/TreeGrid';
import {TreeNode} from '@enonic/lib-admin-ui/ui/treegrid/TreeNode';
import {TreeGridBuilder} from '@enonic/lib-admin-ui/ui/treegrid/TreeGridBuilder';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {PrincipalType} from '@enonic/lib-admin-ui/security/PrincipalType';
import {ResponsiveManager} from '@enonic/lib-admin-ui/ui/responsive/ResponsiveManager';
import {IsAuthenticatedRequest} from '@enonic/lib-admin-ui/security/auth/IsAuthenticatedRequest';
import {IdProviderKey} from '@enonic/lib-admin-ui/security/IdProviderKey';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {LoginResult} from '@enonic/lib-admin-ui/security/auth/LoginResult';
import {KeyBinding} from '@enonic/lib-admin-ui/ui/KeyBinding';
import {UserItem} from '@enonic/lib-admin-ui/security/UserItem';
import {KeyHelper} from '@enonic/lib-admin-ui/ui/KeyHelper';

export class UserItemTypesTreeGrid extends TreeGrid<UserTypeTreeGridItem> {

    private idProviders: IdProvider[];

    private manualIdProvider: boolean;

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

        this.manualIdProvider = false;

        this.initEventHandlers();
    }

    private isFlat(): boolean {
        return this.idProviders.length <= 1;
    }

    private fetchIdProviders(): Q.Promise<IdProvider[]> {
        if (this.idProviders) {
            return Q.resolve(this.idProviders);
        }

        return new ListIdProvidersRequest().sendAndParse().then((idProviders: IdProvider[]) => {
            this.idProviders = idProviders;
            this.toggleClass('flat', this.isFlat());
            return idProviders;
        });
    }

    fetchRoot(): Q.Promise<UserTypeTreeGridItem[]> {
        return Q.spread<LoginResult | IdProvider[], boolean>(
            [new IsAuthenticatedRequest().sendAndParse(), this.fetchIdProviders()],
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
            ...((this.manualIdProvider || !userIsAdmin) ? [] : [
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

    hasChildren(item: UserTypeTreeGridItem): boolean {
        return item.hasChildren();
    }

    fetchChildren(parentNode: TreeNode<UserTypeTreeGridItem>): Q.Promise<UserTypeTreeGridItem[]> {
        return this.fetchIdProviders().then((idProviders: IdProvider[]) => {
            if (idProviders.length > 1) {
                return idProviders.map((idProvider: IdProvider) => new UserTypeTreeGridItemBuilder()
                    .setUserItem(new IdProviderBuilder()
                        .setKey(idProvider.getKey().toString())
                        .setDisplayName(idProvider.getDisplayName())
                        .build()).build());
            }
            return [];
        });
    }

    setIdProvider(idProvider: IdProvider): void {
        this.idProviders = [idProvider];
        this.manualIdProvider = true;
        this.addClass('flat');
    }

    reset(): void {
        this.idProviders = null;
        this.manualIdProvider = false;
        this.removeClass('flat');
        this.deselectAll(true);
    }

    protected createKeyBindings(): KeyBinding[] {
        const result: KeyBinding[] = super.createKeyBindings();

        result.push(new KeyBinding('tab', (event: KeyboardEvent) => {
            this.focusNextOnTab(event);
        }));

        result.push(new KeyBinding('shift+tab', (event: KeyboardEvent) => {
            this.focusPreviousOnShiftTab(event);
        }));

        return result;
    }

    private focusNextOnTab(event: KeyboardEvent): void {
        if (this.isLastItemSelected()) {
            this.focusElementOutOfGrid(event);
        } else {
            this.selectNextItemInGrid(event);
        }
    }

    private isLastItemSelected(): boolean {
        return this.getCurrentData().pop().getUserItem() === this.getFirstSelectedItem()?.getUserItem();
    }

    private focusElementOutOfGrid(event: KeyboardEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.deselectAll(true);
    }

    private selectNextItemInGrid(event: KeyboardEvent): void {
        if (this.getEl().contains(<HTMLElement>event.target)) {
            event.preventDefault();
            event.stopPropagation();
        }

        this.navigateDown();
    }

    private focusPreviousOnShiftTab(event: KeyboardEvent): void {
        if (this.isFirstItemSelected()) {
            this.focusElementOutOfGrid(event);
        } else {
            this.selectPreviousItemInGrid(event);
        }
    }

    private isFirstItemSelected(): boolean {
        return this.getCurrentData()[0].getUserItem() === this.getFirstSelectedItem()?.getUserItem();
    }

    private selectPreviousItemInGrid(event: KeyboardEvent): void {
        if (this.getEl().contains(<HTMLElement>event.target)) {
            // not letting focus go to the unwanted grid elements
            event.preventDefault();
            event.stopPropagation();
            this.navigateUp();
        } else {
            const lastRow: number = this.getCurrentTotal() - 1;
            this.selectRow(lastRow);
            this.scrollToRow(lastRow);
        }
    }

    protected editItem(node: TreeNode<UserTypeTreeGridItem>): void {
        this.handleEditItem(node);
    }

    private initEventHandlers(): void {
        this.getGrid().subscribeOnClick((event, data) => {
            // not letting focus go to the unwanted grid elements
            event.preventDefault();
            event.stopPropagation();

            const node: TreeNode<UserTypeTreeGridItem> = this.getGrid().getDataView().getItem(data.row);
            this.handleEditItem(node);
        });

        this.onKeyUp((event: KeyboardEvent) => {
            if (KeyHelper.isEnterKey(event)) {
                if (this.hasSelectedItems()) {
                    this.handleEditItem(this.getLastSelectedOrHighlightedNode());
                }
            }
        });
    }

    private handleEditItem(node: TreeNode<UserTypeTreeGridItem>): void {
        if (this.isExpandableNode(node)) {
            this.toggleNode(node);
            ResponsiveManager.fireResizeEvent();
        } else {
            this.fireNewPrincipalEvent(node);
        }
    }

    private isExpandableNode(node: TreeNode<UserTypeTreeGridItem>): boolean {
        return !this.isFlat() && this.hasChildren(node.getData());
    }

    private fireNewPrincipalEvent(node: TreeNode<UserTypeTreeGridItem>): void {
        const params: { idProvider?: IdProvider, type: UserTreeGridItemType } = this.getPrincipalProps(node);
        const item: UserTreeGridItem = new UserTreeGridItemBuilder().setType(params.type).setIdProvider(params.idProvider).build();
        new NewPrincipalEvent([item]).fire();
    }

    private getPrincipalProps(node: TreeNode<UserTypeTreeGridItem>): { idProvider?: IdProvider, type: UserTreeGridItemType } {
        const userItem: UserItem = node.getData().getUserItem();

        if (userItem instanceof IdProvider) {
            const isRootNode: boolean = node.calcLevel() === 1;

            if (isRootNode) {
                return {type: UserTreeGridItemType.ID_PROVIDER};
            } else if (node.getParent().getData().getUserItem() instanceof User) {
                return {type: UserTreeGridItemType.USERS, idProvider: userItem};
            } else if (node.getParent().getData().getUserItem() instanceof Group) {
                return {type: UserTreeGridItemType.GROUPS, idProvider: userItem};
            }
        } else if (userItem instanceof Role) {
            return {type: UserTreeGridItemType.ROLES};
        } else if (userItem instanceof User) {
            return {type: UserTreeGridItemType.USERS, idProvider: this.idProviders[0]};
        } else if (userItem instanceof Group) {
            return {type: UserTreeGridItemType.GROUPS, idProvider: this.idProviders[0]};
        }
    }
}
