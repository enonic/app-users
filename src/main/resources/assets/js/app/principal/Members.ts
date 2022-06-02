import {Principal, PrincipalBuilder} from '@enonic/lib-admin-ui/security/Principal';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {MembersJson} from './MembersJson';
import {Equitable} from '@enonic/lib-admin-ui/Equitable';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';

export abstract class Members extends Principal {

    protected readonly members: PrincipalKey[];

    protected constructor(builder: MembersBuilder) {
        super(builder);
        this.members = builder.members || [];
    }

    getMembers(): PrincipalKey[] {
        return this.members.slice(0);
    }

    equals(o: Equitable): boolean {
        if (!ObjectHelper.iFrameSafeInstanceOf(o, Members)) {
            return false;
        }

        const other: Members = <Members> o;
        return super.equals(o) && ObjectHelper.arrayEquals(this.members, other.getMembers());
    }

    abstract clone(): Members;
}

export abstract class MembersBuilder
    extends PrincipalBuilder {

    members: PrincipalKey[] = [];

    protected constructor(source?: Members) {
        super(source);
        if (source) {
            this.members = source.getMembers().slice(0);
        }
    }

    fromJson(json: MembersJson): MembersBuilder {
        super.fromJson(json);

        if (json.members) {
            this.members = json.members.map((memberStr: string) => PrincipalKey.fromString(memberStr));
        }

        return this;
    }

    setMembers(members: PrincipalKey[]): MembersBuilder {
        this.members = members || [];
        return this;
    }

    abstract build(): Members;
}
