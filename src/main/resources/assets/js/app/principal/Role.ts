import {RoleJson} from './RoleJson';
import {assert} from 'lib-admin-ui/util/Assert';
import {Equitable} from 'lib-admin-ui/Equitable';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {Membership, MembershipBuilder} from './Membership';

export class Role
    extends Membership {

    constructor(builder: RoleBuilder) {
        super(builder);
        assert(this.getKey().isRole(), 'Expected PrincipalKey of type Role');
    }

    equals(o: Equitable): boolean {
        if (!ObjectHelper.iFrameSafeInstanceOf(o, Role)) {
            return false;
        }

        return super.equals(o);
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
        return <Role>new RoleBuilder().fromJson(json).build();
    }
}

export class RoleBuilder
    extends MembershipBuilder {

    constructor(source?: Role) {
        super(source);
    }

    build(): Role {
        return new Role(this);
    }
}
