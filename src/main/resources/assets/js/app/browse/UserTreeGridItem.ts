import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {PrincipalType} from '@enonic/lib-admin-ui/security/PrincipalType';
import {UserItem} from '@enonic/lib-admin-ui/security/UserItem';
import {IdProvider} from '../principal/IdProvider';
import {Equitable} from '@enonic/lib-admin-ui/Equitable';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {ViewItem} from '@enonic/lib-admin-ui/app/view/ViewItem';

export enum UserTreeGridItemType {
    ID_PROVIDER,
    PRINCIPAL,
    GROUPS,
    USERS,
    ROLES
}

export class UserTreeGridItem
    implements ViewItem {

    private idProvider: IdProvider;

    private principal: Principal;

    private type: UserTreeGridItemType;

    private modifiedTime: Date;

    private children: boolean;

    constructor(builder: UserTreeGridItemBuilder) {
        this.idProvider = builder.idProvider;
        this.principal = builder.principal;
        this.type = builder.type;
        this.children = builder.children || false;

        if (this.type === UserTreeGridItemType.PRINCIPAL) {
            this.modifiedTime = this.principal.getModifiedTime();
        }
    }

    static fromIdProvider(idProvider: IdProvider): UserTreeGridItem {
        return new UserTreeGridItemBuilder().setIdProvider(idProvider).setType(UserTreeGridItemType.ID_PROVIDER).build();
    }

    setIdProvider(idProvider: IdProvider): void {
        this.idProvider = idProvider;
    }

    setPrincipal(principal: Principal): void {
        this.principal = principal;
    }

    setType(type: UserTreeGridItemType): void {
        this.type = type;
    }

    getType(): UserTreeGridItemType {
        return this.type;
    }

    getPrincipal(): Principal {
        return this.principal;
    }

    getItemDisplayName(): string {
        switch (this.type) {
        case UserTreeGridItemType.ID_PROVIDER:
            return this.idProvider.getDisplayName();

        case UserTreeGridItemType.PRINCIPAL:
            return this.principal.getDisplayName();

        case UserTreeGridItemType.ROLES:
            return i18n('field.roles');

        case UserTreeGridItemType.USERS:
            return i18n('field.users');

        case UserTreeGridItemType.GROUPS:
            return i18n('field.groups');

        }
        return '';
    }

    getId(): string {
        switch (this.type) {
        case UserTreeGridItemType.ID_PROVIDER:
            return this.idProvider.getKey().toString();

        case UserTreeGridItemType.PRINCIPAL:
            return this.principal.getKey().toString().toLowerCase();

        case UserTreeGridItemType.GROUPS:
            return this.idProvider.getKey().toString() + '/groups';

        case UserTreeGridItemType.ROLES:
            return '/roles';

        case UserTreeGridItemType.USERS:
            return this.idProvider.getKey().toString() + '/users';
        default:
            return '';
        }

    }

    isUser(): boolean {
        return this.type === UserTreeGridItemType.USERS;
    }

    isUserGroup(): boolean {
        return this.type === UserTreeGridItemType.GROUPS;
    }

    isIdProvider(): boolean {
        return this.type === UserTreeGridItemType.ID_PROVIDER;
    }

    isRole(): boolean {
        return this.type === UserTreeGridItemType.ROLES;
    }

    isPrincipal(): boolean {
        return this.type === UserTreeGridItemType.PRINCIPAL;
    }

    setChildren(children: boolean): void {
        this.children = children;
    }

    hasChildren(): boolean {
        return this.isIdProvider() || this.isRole() || this.children;
    }

    hasChildrenItems(): boolean {
        return this.children;
    }

    equals(o: Equitable): boolean {
        if (!ObjectHelper.iFrameSafeInstanceOf(o, UserTreeGridItem)) {
            return false;
        }

        const other:UserTreeGridItem = o as UserTreeGridItem;
        return this.type === other.getType() && this.principal === other.getPrincipal() && this.idProvider === other.getIdProvider();
    }

    static create(): UserTreeGridItemBuilder {
        return new UserTreeGridItemBuilder();
    }

    getIdProvider(): IdProvider {
        return this.idProvider;
    }

    static fromPrincipal(principal: Principal): UserTreeGridItem {
        return new UserTreeGridItemBuilder().setPrincipal(principal).setType(UserTreeGridItemType.PRINCIPAL).build();
    }

    static getParentType(principal: Principal): UserTreeGridItemType {
        switch (principal.getType()) {
        case PrincipalType.GROUP:
            return UserTreeGridItemType.GROUPS;
        case PrincipalType.USER:
            return UserTreeGridItemType.USERS;
        case PrincipalType.ROLE:
            return UserTreeGridItemType.ROLES;
        default:
            return null;
        }
    }

    getDisplayName(): string {
        return this.getItemDisplayName();
    }

    getIconClass(): string {
        switch (this.getType()) {
        case UserTreeGridItemType.ID_PROVIDER:
            return 'icon-address-book icon-large';

        case UserTreeGridItemType.PRINCIPAL:
            if (this.getPrincipal().isRole()) {
                return 'icon-masks icon-large';

            } else if (this.getPrincipal().isUser()) {
                return 'icon-user icon-large';

            } else if (this.getPrincipal().isGroup()) {
                return 'icon-users icon-large';
            }
            break;

        case UserTreeGridItemType.GROUPS:
            return 'icon-folder icon-large';

        case UserTreeGridItemType.ROLES:
            return 'icon-folder icon-large';

        case UserTreeGridItemType.USERS:
            return 'icon-folder icon-large';
        }
    }

    getIconUrl(): string {
        return '';
    }
}

export class UserTreeGridItemBuilder {
    idProvider: IdProvider;
    principal: Principal;
    type: UserTreeGridItemType;
    children: boolean;

    setIdProvider(idProvider: IdProvider): UserTreeGridItemBuilder {
        this.idProvider = idProvider;
        return this;
    }

    setPrincipal(principal: Principal): UserTreeGridItemBuilder {
        this.principal = principal;
        return this;
    }

    setType(type: UserTreeGridItemType): UserTreeGridItemBuilder {
        this.type = type;
        return this;
    }

    setHasChildren(value: boolean): UserTreeGridItemBuilder {
        this.children = value;
        return this;
    }

    setAny(userItem: UserItem): UserTreeGridItemBuilder {
        if (userItem instanceof Principal) {
            return this.setPrincipal(userItem).setType(UserTreeGridItemType.PRINCIPAL);
        } else if (userItem instanceof IdProvider) {
            return this.setIdProvider(userItem).setType(UserTreeGridItemType.ID_PROVIDER);
        }
        return this;
    }

    build(): UserTreeGridItem {
        return new UserTreeGridItem(this);
    }
}
