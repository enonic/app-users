import {Principal} from 'lib-admin-ui/security/Principal';
import {IdProviderAccess} from './IdProviderAccess';
import {IdProviderAccessControlEntryJson} from './IdProviderAccessControlEntryJson';
import {Equitable} from 'lib-admin-ui/Equitable';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {PrincipalContainer} from 'lib-admin-ui/ui/security/PrincipalContainer';

export class IdProviderAccessControlEntry
    extends PrincipalContainer
    implements Equitable {

    private access: IdProviderAccess;

    constructor(principal: Principal, access: IdProviderAccess = IdProviderAccess.CREATE_USERS) {
        super(principal);
        this.access = access;
    }

    getPrincipal(): Principal {
        return this.principal;
    }

    static fromJson(json: IdProviderAccessControlEntryJson): IdProviderAccessControlEntry {
        return new IdProviderAccessControlEntry(Principal.fromJson(json.principal), IdProviderAccess[json.access.toUpperCase()]);
    }

    getAccess(): IdProviderAccess {
        return this.access;
    }

    setAccess(value: string): IdProviderAccessControlEntry {
        this.access = IdProviderAccess[value];
        return this;
    }

    getId(): string {
        return `${this.principal.getKey().toString()}.${IdProviderAccess[this.access]}`;
    }

    equals(o: Equitable): boolean {
        if (!ObjectHelper.iFrameSafeInstanceOf(o, IdProviderAccessControlEntry)) {
            return false;
        }
        let other = <IdProviderAccessControlEntry>o;
        return this.principal.equals(other.getPrincipal()) &&
               this.access === other.access;
    }

    toString(): string {
        return this.principal.getKey().toString() + '[' + IdProviderAccess[this.access] + ']';
    }

    toJson(): IdProviderAccessControlEntryJson {
        return {
            principal: this.principal.toJson(),
            access: IdProviderAccess[this.access]
        };
    }
}
