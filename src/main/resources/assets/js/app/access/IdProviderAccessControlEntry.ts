import {Principal} from 'lib-admin-ui/security/Principal';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {IdProviderAccess} from './IdProviderAccess';
import {IdProviderAccessControlEntryJson} from './IdProviderAccessControlEntryJson';
import {Equitable} from 'lib-admin-ui/Equitable';
import {assertNotNull} from 'lib-admin-ui/util/Assert';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';

export class IdProviderAccessControlEntry
    implements Equitable {

    private principal: Principal;

    private access: IdProviderAccess;

    constructor(principal: Principal, access?: IdProviderAccess) {
        assertNotNull(principal, 'principal not set');
        //    assertNotNull(access, 'access not set');
        this.principal = principal;
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

    getPrincipalKey(): PrincipalKey {
        return this.principal.getKey();
    }

    getPrincipalDisplayName(): string {
        return this.principal.getDisplayName();
    }

    getPrincipalTypeName(): string {
        return this.principal.getTypeName();
    }

    setAccess(value: string): IdProviderAccessControlEntry {
        this.access = IdProviderAccess[value];
        return this;
    }

    getId(): string {
        return this.principal.getKey().toString();
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
