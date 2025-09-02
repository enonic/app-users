import Q from 'q';
import {UserTypeTreeGridItem, UserTypeTreeGridItemBuilder} from './UserTypeTreeGridItem';
import {NewPrincipalEvent} from '../browse/NewPrincipalEvent';
import {UserTreeGridItem, UserTreeGridItemBuilder, UserTreeGridItemType} from '../browse/UserTreeGridItem';
import {ListIdProvidersRequest} from '../../graphql/idprovider/ListIdProvidersRequest';
import {IdProvider, IdProviderBuilder} from '../principal/IdProvider';
import {User, UserBuilder} from '../principal/User';
import {Group, GroupBuilder} from '../principal/Group';
import {Role, RoleBuilder} from '../principal/Role';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {PrincipalType} from '@enonic/lib-admin-ui/security/PrincipalType';
import {IdProviderKey} from '@enonic/lib-admin-ui/security/IdProviderKey';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {UserItem} from '@enonic/lib-admin-ui/security/UserItem';
import {TreeListBox, TreeListBoxParams, TreeListElement, TreeListElementParams} from '@enonic/lib-admin-ui/ui/selector/list/TreeListBox';
import {UserTypesTreeGridItemViewer} from './UserTypesTreeGridItemViewer';
import {AuthHelper} from '@enonic/lib-admin-ui/auth/AuthHelper';

export class UserItemTypesTreeGrid
    extends TreeListBox<UserTypeTreeGridItem> {

    private static allIDProviders: IdProvider[];

    private presetIdProvider: IdProvider;

    constructor(params?: TreeListBoxParams<UserTypeTreeGridItem>) {
        super(params);
    }

    protected createItemView(item: UserTypeTreeGridItem, readOnly: boolean): UserItemTypesTreeGridListElement {
        return new UserItemTypesTreeGridListElement(item,
            {presetIdProvider: this.presetIdProvider, scrollParent: this.scrollParent, parentList: this});
    }

    protected getItemId(item: UserTypeTreeGridItem): string {
        return item.getId();
    }

    private fetchIdProviders(): Q.Promise<IdProvider[]> {
        if (this.presetIdProvider) {
            return Q.resolve([this.presetIdProvider]);
        }

        if (UserItemTypesTreeGrid.allIDProviders) {
            return Q.resolve(UserItemTypesTreeGrid.allIDProviders);
        }

        return new ListIdProvidersRequest().sendAndParse().then((idProviders: IdProvider[]) => {
            UserItemTypesTreeGrid.allIDProviders = idProviders;
            return idProviders;
        });
    }

    protected handleLazyLoad(): void {
        if (this.getItemCount() === 0) {
            this.load();
        }
    }

    load(): void {
        this.fetchItems().then((items: UserTypeTreeGridItem[]) => {
            if (items.length > 0) {
                this.setItems(items);
            }
        }).catch(DefaultErrorHandler.handle);
    }

    private fetchItems(): Q.Promise<UserTypeTreeGridItem[]> {
        return this.isRoot() ? this.fetchRoot() : this.fetchChildren();
    }

    private isRoot(): boolean {
        return !this.options.parentListElement;
    }

    private fetchRoot(): Q.Promise<UserTypeTreeGridItem[]> {
        return this.fetchIdProviders().then(() => [
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
            ...((this.presetIdProvider || !AuthHelper.isUserAdmin()) ? [] : [
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

    private fetchChildren(): Q.Promise<UserTypeTreeGridItem[]> {
        return Q.resolve(UserItemTypesTreeGrid.allIDProviders.map((idProvider: IdProvider) => new UserTypeTreeGridItemBuilder()
            .setUserItem(new IdProviderBuilder()
                .setKey(idProvider.getKey().toString())
                .setDisplayName(idProvider.getDisplayName())
                .build()).build()));
    }

    setIdProvider(idProvider: IdProvider): void {
        this.presetIdProvider = idProvider;
    }

    reset(): void {
        this.presetIdProvider = null;
        UserItemTypesTreeGrid.allIDProviders = null;
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered: boolean) => {
            this.addClass('user-types-tree-grid');

            return rendered;
        });
    }
}

export interface UserItemTypesTreeGridListElementParams extends TreeListElementParams<UserTypeTreeGridItem> {
    presetIdProvider?: IdProvider;
}

export class UserItemTypesTreeGridListElement
    extends TreeListElement<UserTypeTreeGridItem> {

    protected options: UserItemTypesTreeGridListElementParams;

    constructor(item: UserTypeTreeGridItem, params: UserItemTypesTreeGridListElementParams) {
        super(item, params);
    }

    protected initListeners(): void {
        super.initListeners();

        this.getDataView().onClicked((event: MouseEvent) => {
            if (event.target === this.toggleElement.getHTMLElement()) {
                return;
            }

            if (this.hasChildren()) {
                this.setExpanded(!this.isExpanded());
            } else {
                this.fireNewPrincipalEvent();
            }
        });
    }

    protected createChildrenList(params?: TreeListBoxParams<UserTypeTreeGridItem>): TreeListBox<UserTypeTreeGridItem> {
        return new UserItemTypesTreeGrid(params);
    }

    hasChildren(): boolean {
        return this.item.hasChildren() && !this.options.presetIdProvider;
    }

    protected createItemViewer(item: UserTypeTreeGridItem): UserTypesTreeGridItemViewer {
        const isRootNode = this.getLevel() === 0;
        const viewer = new UserTypesTreeGridItemViewer(isRootNode);
        viewer.setObject(item);

        return viewer;
    }

    private fireNewPrincipalEvent(): void {
        const params: { idProvider?: IdProvider, type: UserTreeGridItemType } = this.getPrincipalProps();
        const item: UserTreeGridItem = new UserTreeGridItemBuilder().setType(params.type).setIdProvider(params.idProvider).build();
        new NewPrincipalEvent([item]).fire();
    }

    private getPrincipalProps(): { idProvider?: IdProvider, type: UserTreeGridItemType } {
        const userItem: UserItem = this.item.getUserItem();

        if (userItem instanceof IdProvider) {
            const isRootNode: boolean = this.getLevel() === 0;

            if (isRootNode) {
                return {type: UserTreeGridItemType.ID_PROVIDER};
            } else if (this.getParentList().getParentItem()?.getUserItem() instanceof User) {
                return {type: UserTreeGridItemType.USERS, idProvider: userItem};
            } else if (this.getParentList().getParentItem()?.getUserItem() instanceof Group) {
                return {type: UserTreeGridItemType.GROUPS, idProvider: userItem};
            }
        } else if (userItem instanceof Role) {
            return {type: UserTreeGridItemType.ROLES};
        } else if (userItem instanceof User) {
            return {type: UserTreeGridItemType.USERS, idProvider: this.options.presetIdProvider};
        } else if (userItem instanceof Group) {
            return {type: UserTreeGridItemType.GROUPS, idProvider: this.options.presetIdProvider};
        }
    }

}
