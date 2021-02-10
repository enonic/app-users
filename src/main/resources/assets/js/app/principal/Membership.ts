import {Principal, PrincipalBuilder} from 'lib-admin-ui/security/Principal';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {MembershipJson} from './MembershipJson';
import {Equitable} from 'lib-admin-ui/Equitable';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';

export abstract class Membership extends Principal {

    protected readonly members: PrincipalKey[];

    protected constructor(builder: MembershipBuilder) {
        super(builder);
        this.members = builder.members || [];
    }

    getMembers(): PrincipalKey[] {
        return this.members.slice(0);
    }

    equals(o: Equitable): boolean {
        if (!ObjectHelper.iFrameSafeInstanceOf(o, Membership)) {
            return false;
        }

        const other: Membership = <Membership> o;
        return super.equals(o) && ObjectHelper.arrayEquals(this.members, other.getMembers());
    }

    abstract clone(): Membership;
}

export abstract class MembershipBuilder
    extends PrincipalBuilder {

    members: PrincipalKey[] = [];

    protected constructor(source?: Membership) {
        super(source);
        if (source) {
            this.members = source.getMembers().slice(0);
        }
    }

    fromJson(json: MembershipJson): MembershipBuilder {
        super.fromJson(json);

        if (json.members) {
            this.members = json.members.map((memberStr: string) => PrincipalKey.fromString(memberStr));
        }

        return this;
    }

    setMembers(members: PrincipalKey[]): MembershipBuilder {
        this.members = members || [];
        return this;
    }

    abstract build(): Membership;
}
