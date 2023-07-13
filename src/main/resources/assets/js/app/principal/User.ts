import {Principal, PrincipalBuilder} from '@enonic/lib-admin-ui/security/Principal';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {UserJson} from './UserJson';
import {assert} from '@enonic/lib-admin-ui/util/Assert';
import {Equitable} from '@enonic/lib-admin-ui/Equitable';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {PublicKey} from '../browse/serviceaccount/PublicKey';

export class User
    extends Principal {

    private readonly email: string;

    private readonly login: string;

    private readonly loginDisabled: boolean;

    private readonly memberships: Principal[];

    private readonly publicKeys: PublicKey[];

    constructor(builder: UserBuilder) {
        super(builder);
        assert(this.getKey().isUser(), 'Expected PrincipalKey of type User');
        this.email = builder.email || '';
        this.login = builder.login || '';
        this.loginDisabled = builder.loginDisabled || false;
        this.memberships = builder.memberships || [];
        this.publicKeys = builder.publicKeys || [];
    }

    getEmail(): string {
        return this.email;
    }

    getLogin(): string {
        return this.login;
    }

    isDisabled(): boolean {
        return this.loginDisabled;
    }

    getMemberships(): Principal[] {
        return this.memberships.slice(0);
    }

    getPublicKeys(): PublicKey[] {
        return this.publicKeys.slice(0);
    }

    equals(o: Equitable): boolean {
        if (!ObjectHelper.iFrameSafeInstanceOf(o, User)) {
            return false;
        }

        let other = o as User;

        return super.equals(o) &&
               this.loginDisabled === other.isDisabled() &&
               this.email === other.getEmail() &&
               this.login === other.getLogin() &&
               ObjectHelper.arrayEquals(this.memberships, other.getMemberships()) &&
               ObjectHelper.arrayEquals(this.publicKeys, other.getPublicKeys());
    }

    clone(): User {
        return this.newBuilder().build();
    }

    newBuilder(): UserBuilder {
        return new UserBuilder(this);
    }

    static create(): UserBuilder {
        return new UserBuilder();
    }

    static fromJson(json: UserJson): User {
        return new UserBuilder().fromJson(json).build();
    }

}

export class UserBuilder
    extends PrincipalBuilder {

    email: string;

    login: string;

    loginDisabled: boolean;

    memberships: Principal[] = [];

    publicKeys: PublicKey[] = [];

    constructor(source?: User) {
        super(source);
        if (source) {
            this.key = source.getKey();
            this.displayName = source.getDisplayName();
            this.email = source.getEmail();
            this.login = source.getLogin();
            this.loginDisabled = source.isDisabled();
            this.modifiedTime = source.getModifiedTime();
            this.memberships = source.getMemberships().slice(0);
            this.publicKeys = source.getPublicKeys().slice(0);
        }
    }

    fromJson(json: UserJson): UserBuilder {
        super.fromJson(json);

        this.email = json.email;
        this.login = json.login;
        this.loginDisabled = json.loginDisabled;

        if (json.memberships) {
            this.memberships = json.memberships.map((principalJson) => Principal.fromJson(principalJson));
        }
        if (json.publicKeys) {
            this.publicKeys = json.publicKeys.map((publicKeyJson) => PublicKey.fromJson(publicKeyJson));
        }
        return this;
    }

    protected getKeyFromJson(json: UserJson): PrincipalKey {
        const key = super.getKeyFromJson(json);
        return json.name ? PrincipalKey.ofUser(key.getIdProvider(), json.name) : key;
    }

    setEmail(value: string): UserBuilder {
        this.email = value;
        return this;
    }

    setLogin(value: string): UserBuilder {
        this.login = value;
        return this;
    }

    setDisabled(value: boolean): UserBuilder {
        this.loginDisabled = value;
        return this;
    }

    setMemberships(memberships: Principal[]): UserBuilder {
        this.memberships = memberships || [];
        return this;
    }

    build(): User {
        return new User(this);
    }
}
