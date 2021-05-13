import {Principal, PrincipalBuilder} from 'lib-admin-ui/security/Principal';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {GroupJson} from './GroupJson';
import {assert} from 'lib-admin-ui/util/Assert';
import {Equitable} from 'lib-admin-ui/Equitable';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {Members, MembersBuilder} from './Members';

export class Group
    extends Members {

    private readonly memberships: Principal[];

    constructor(builder: GroupBuilder) {
        super(builder);
        assert(this.getKey().isGroup(), 'Expected PrincipalKey of type Group');
        this.memberships = builder.memberships || [];
    }

    getMemberships(): Principal[] {
        return this.memberships.slice(0);
    }

    equals(o: Equitable): boolean {
        if (!ObjectHelper.iFrameSafeInstanceOf(o, Group)) {
            return false;
        }

        const other: Group = <Group> o;

        return super.equals(o) && ObjectHelper.arrayEquals(this.memberships, other.getMemberships());
    }

    clone(): Group {
        return this.newBuilder().build();
    }

    newBuilder(): GroupBuilder {
        return new GroupBuilder(this);
    }

    static create(): GroupBuilder {
        return new GroupBuilder();
    }

    static fromJson(json: GroupJson): Group {
        return new GroupBuilder().fromJson(json).build();
    }
}

export class GroupBuilder
    extends MembersBuilder {

    memberships: Principal[] = [];

    constructor(source?: Group) {
        super(source);

        if (source) {
            this.members = source.getMembers().slice(0);
            this.memberships = source.getMemberships().slice(0);
        }
    }

    fromJson(json: GroupJson): GroupBuilder {
        super.fromJson(json);

        if (json.memberships) {
            this.memberships = json.memberships.map((principalJson) => Principal.fromJson(principalJson));
        }

        return this;
    }

    setMemberships(memberships: Principal[]): GroupBuilder {
        this.memberships = memberships || [];
        return this;
    }

    build(): Group {
        return new Group(this);
    }
}
