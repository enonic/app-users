import UserItem = api.security.UserItem;
import IdProviderConfig = api.security.IdProviderConfig;
import IdProviderMode = api.security.IdProviderMode;
import PrincipalType = api.security.PrincipalType;
import UserItemBuilder = api.security.UserItemBuilder;
import IdProviderKey = api.security.IdProviderKey;
import {ListPrincipalsRequest, ListPrincipalsResult} from '../../api/graphql/principal/ListPrincipalsRequest';
import {IdProviderAccessControlList} from '../access/IdProviderAccessControlList';
import {IdProviderJson} from './IdProviderJson';

export class IdProvider
    extends UserItem {

    private idProviderConfig: IdProviderConfig;

    private idProviderMode: IdProviderMode;

    private permissions: IdProviderAccessControlList;

    constructor(builder: IdProviderBuilder) {
        super(builder);
        this.idProviderConfig = builder.idProviderConfig;
        this.idProviderMode = builder.idProviderMode;
        this.permissions = builder.permissions || new IdProviderAccessControlList();
    }

    getIdProviderConfig(): IdProviderConfig {
        return this.idProviderConfig;
    }

    getIdProviderMode(): IdProviderMode {
        return this.idProviderMode;
    }

    static checkOnDeletable(key: IdProviderKey): wemQ.Promise<boolean> {
        return key ? IdProvider.create().setKey(key.toString()).build().isDeletable() : wemQ(false);
    }

    isDeletable(): wemQ.Promise<boolean> {
        return new ListPrincipalsRequest()
            .setIdProviderKey(this.getKey())
            .setTypes([PrincipalType.USER, PrincipalType.GROUP])
            .sendAndParse()
            .then((result: ListPrincipalsResult) => (result.total === 0));
    }

    static create(): IdProviderBuilder {
        return new IdProviderBuilder();
    }

    static fromJson(json: IdProviderJson): IdProvider {
        return new IdProviderBuilder().fromJson(json).build();
    }

    getPermissions(): IdProviderAccessControlList {
        return this.permissions;
    }

    getKey(): IdProviderKey {
        return <IdProviderKey>super.getKey();
    }

    equals(o: api.Equitable, ignoreEmptyValues: boolean = false): boolean {
        if (!api.ObjectHelper.iFrameSafeInstanceOf(o, IdProvider)) {
            return false;
        }

        let other = <IdProvider> o;

        return super.equals(other) &&
               ((!this.idProviderConfig && !other.idProviderConfig) ||
                (this.idProviderConfig && this.idProviderConfig.equals(other.idProviderConfig, ignoreEmptyValues))) &&
               this.permissions.equals(other.permissions);
    }

    clone(): IdProvider {
        return this.newBuilder().build();
    }

    newBuilder(): IdProviderBuilder {
        return new IdProviderBuilder(this);
    }
}

export class IdProviderBuilder
    extends UserItemBuilder {

    idProviderConfig: IdProviderConfig;

    idProviderMode: IdProviderMode;

    permissions: IdProviderAccessControlList;

    constructor(source?: IdProvider) {
        if (source) {
            super(source);
            this.idProviderMode = source.getIdProviderMode();
            this.idProviderConfig = !!source.getIdProviderConfig() ? source.getIdProviderConfig().clone() : null;
            this.permissions = !!source.getPermissions() ? source.getPermissions().clone() : null;
        }
    }

    fromJson(json: IdProviderJson): IdProviderBuilder {
        super.fromJson(json);
        this.key = new IdProviderKey(json.key);
        this.idProviderConfig = json.idProviderConfig ? IdProviderConfig.fromJson(json.idProviderConfig) : null;
        this.idProviderMode = json.idProviderMode ? IdProviderMode[json.idProviderMode] : null;
        this.permissions = json.permissions ? IdProviderAccessControlList.fromJson(json.permissions) : null;
        return this;
    }

    setKey(key: string): IdProviderBuilder {
        this.key = IdProviderKey.fromString(key);
        return this;
    }

    setIdProviderConfig(idProviderConfig: IdProviderConfig): IdProviderBuilder {
        this.idProviderConfig = idProviderConfig;
        return this;
    }

    setIdProviderMode(idProviderMode: IdProviderMode): IdProviderBuilder {
        this.idProviderMode = idProviderMode;
        return this;
    }

    setPermissions(permissions: IdProviderAccessControlList): IdProviderBuilder {
        this.permissions = permissions;
        return this;
    }

    setDisplayName(displayName: string): IdProviderBuilder {
        super.setDisplayName(displayName);
        return this;
    }

    setDescription(description: string): IdProviderBuilder {
        super.setDescription(description);
        return this;
    }

    build(): IdProvider {
        return new IdProvider(this);
    }
}
