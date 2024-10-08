import {assert} from '@enonic/lib-admin-ui/util/Assert';
import {Equitable} from '@enonic/lib-admin-ui/Equitable';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {Members, MembersBuilder} from './Members';
import {MembersJson} from './MembersJson';

export class Role
    extends Members {

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

    static fromJson(json: MembersJson): Role {
        return new RoleBuilder().fromJson(json).build() as Role;
    }
}

export class RoleBuilder
    extends MembersBuilder {

    constructor(source?: Role) {
        super(source);
    }

    build(): Role {
        return new Role(this);
    }
}
