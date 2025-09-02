import {Equitable} from '@enonic/lib-admin-ui/Equitable';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {IdProviderConfig} from '@enonic/lib-admin-ui/security/IdProviderConfig';
import {IdProviderKey} from '@enonic/lib-admin-ui/security/IdProviderKey';
import {IdProviderMode} from '@enonic/lib-admin-ui/security/IdProviderMode';
import {PrincipalType} from '@enonic/lib-admin-ui/security/PrincipalType';
import {UserItem, UserItemBuilder} from '@enonic/lib-admin-ui/security/UserItem';
import Q from 'q';
import {ListPrincipalsData, ListPrincipalsRequest} from '../../graphql/principal/ListPrincipalsRequest';
import {IdProviderAccessControlList} from '../access/IdProviderAccessControlList';
import {IdProviderJson} from './IdProviderJson';

export class IdProvider
    extends UserItem {

    private readonly idProviderConfig: IdProviderConfig;

    private readonly idProviderMode: IdProviderMode;

    private readonly permissions: IdProviderAccessControlList;

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

    static checkOnDeletable(key: IdProviderKey): Q.Promise<boolean> {
        return key ? IdProvider.create().setKey(key.toString()).build().isDeletable() : Q(false);
    }

    isDeletable(): Q.Promise<boolean> {
        // setCount(1): Only total is used, so there's no need to traverse everything.
        return new ListPrincipalsRequest()
            .setIdProviderKey(this.getKey())
            .setTypes([PrincipalType.USER, PrincipalType.GROUP])
            .setCount(0)
            .sendAndParse()
            .then((result: ListPrincipalsData) => (result.total === 0));
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
        return super.getKey() as IdProviderKey;
    }

    equals(o: Equitable, ignoreEmptyValues: boolean = false): boolean {
        if (!ObjectHelper.iFrameSafeInstanceOf(o, IdProvider)) {
            return false;
        }

        let other = o as IdProvider;

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
        super(source);
        if (source) {
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
