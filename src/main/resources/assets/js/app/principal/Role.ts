import {Principal, PrincipalBuilder} from 'lib-admin-ui/security/Principal';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {RoleJson} from './RoleJson';
import {assert} from 'lib-admin-ui/util/Assert';
import {Equitable} from 'lib-admin-ui/Equitable';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';

export class Role
    extends Principal {

    private members: PrincipalKey[];

    constructor(builder: RoleBuilder) {
        super(builder);
        assert(this.getKey().isRole(), 'Expected PrincipalKey of type Role');
        this.members = builder.members || [];
    }

    getMembers(): PrincipalKey[] {
        return this.members;
    }

    equals(o: Equitable): boolean {
        if (!ObjectHelper.iFrameSafeInstanceOf(o, Role)) {
            return false;
        }

        let other = <Role> o;
        return super.equals(o) && ObjectHelper.arrayEquals(this.members, other.getMembers());
    }

    clone(): Role {
        return this.newBuilder().build();
    }

    newBuilder(): RoleBuilder {
        return new RoleBuilder(this);
    }

    static create(): RoleBuilder {
        return new RoleBuilder();
    }

    static fromJson(json: RoleJson): Role {
        return new RoleBuilder().fromJson(json).build();
    }
}

export class RoleBuilder
    extends PrincipalBuilder {

    members: PrincipalKey[] = [];

    constructor(source?: Role) {
        super(source);
        if (source) {
            this.members = source.getMembers().slice(0);
        }
    }

    fromJson(json: RoleJson): RoleBuilder {
        super.fromJson(json);

        if (json.members) {
            this.members = json.members.map((memberStr) => PrincipalKey.fromString(memberStr));
        }
        return this;
    }

    setMembers(members: PrincipalKey[]): RoleBuilder {
        this.members = members || [];
        return this;
    }

    build(): Role {
        return new Role(this);
    }
}
