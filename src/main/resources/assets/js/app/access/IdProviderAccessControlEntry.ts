import Principal = api.security.Principal;
import PrincipalKey = api.security.PrincipalKey;
import {IdProviderAccess} from './IdProviderAccess';
import {IdProviderAccessControlEntryJson} from './IdProviderAccessControlEntryJson';

export class IdProviderAccessControlEntry
    implements api.Equitable {

    private principal: Principal;

    private access: IdProviderAccess;

    constructor(principal: Principal, access?: IdProviderAccess) {
        api.util.assertNotNull(principal, 'principal not set');
        //    api.util.assertNotNull(access, 'access not set');
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

    equals(o: api.Equitable): boolean {
        if (!api.ObjectHelper.iFrameSafeInstanceOf(o, IdProviderAccessControlEntry)) {
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
