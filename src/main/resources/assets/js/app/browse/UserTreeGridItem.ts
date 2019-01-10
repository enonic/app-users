import Principal = api.security.Principal;
import PrincipalType = api.security.PrincipalType;
import UserItem = api.security.UserItem;
import i18n = api.util.i18n;
import {IdProvider} from '../principal/IdProvider';

export enum UserTreeGridItemType {
    ID_PROVIDER,
    PRINCIPAL,
    GROUPS,
    USERS,
    ROLES
}

export class UserTreeGridItem implements api.Equitable {

    private idProvider: IdProvider;

    private principal: Principal;

    private type: UserTreeGridItemType;

    private modifiedTime: Date;

    constructor(builder: UserTreeGridItemBuilder) {
        this.idProvider = builder.idProvider;
        this.principal = builder.principal;
        this.type = builder.type;

        if (this.type === UserTreeGridItemType.PRINCIPAL) {
            this.modifiedTime = this.principal.getModifiedTime();
        }
    }

    static fromIdProvider(idProvider: IdProvider): UserTreeGridItem {
        return new UserTreeGridItemBuilder().setIdProvider(idProvider).setType(UserTreeGridItemType.ID_PROVIDER).build();
    }

    setIdProvider(idProvider: IdProvider) {
        this.idProvider = idProvider;
    }

    setPrincipal(principal: Principal) {
        this.principal = principal;
    }

    setType(type: UserTreeGridItemType) {
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

    getDataId(): string {
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

    hasChildren(): boolean {
        return (this.isUser() || this.isUserGroup() || this.isIdProvider() || this.isRole());
    }

    equals(o: api.Equitable): boolean {
        if (!api.ObjectHelper.iFrameSafeInstanceOf(o, UserTreeGridItem)) {
            return false;
        }

        let other = <UserTreeGridItem> o;
        return this.principal === other.getPrincipal() && this.idProvider === other.getIdProvider();
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
}

export class UserTreeGridItemBuilder {
    idProvider: IdProvider;
    principal: Principal;
    type: UserTreeGridItemType;

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
