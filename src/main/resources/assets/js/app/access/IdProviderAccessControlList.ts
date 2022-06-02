import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {IdProviderAccessControlEntry} from './IdProviderAccessControlEntry';
import {IdProviderAccessControlEntryJson} from './IdProviderAccessControlEntryJson';
import {Equitable} from '@enonic/lib-admin-ui/Equitable';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';

export class IdProviderAccessControlList
    implements Equitable {

    private entries: { [key: string]: IdProviderAccessControlEntry };

    constructor(entries?: IdProviderAccessControlEntry[]) {
        this.entries = {};
        if (entries) {
            this.addAll(entries);
        }
    }

    static fromJson(json: IdProviderAccessControlEntryJson[]): IdProviderAccessControlList {
        let acl = new IdProviderAccessControlList();
        json.forEach((entryJson: IdProviderAccessControlEntryJson) => {
            let entry = IdProviderAccessControlEntry.fromJson(entryJson);
            acl.add(entry);
        });
        return acl;
    }

    getEntries(): IdProviderAccessControlEntry[] {
        let values = [];
        for (let key in this.entries) {
            if (this.entries.hasOwnProperty(key)) {
                values.push(this.entries[key]);
            }
        }
        return values;
    }

    getEntry(principalKey: PrincipalKey): IdProviderAccessControlEntry {
        return this.entries[principalKey.toString()];
    }

    add(entry: IdProviderAccessControlEntry): void {
        this.entries[entry.getPrincipal().getKey().toString()] = entry;
    }

    contains(principalKey: PrincipalKey): boolean {
        return this.entries.hasOwnProperty(principalKey.toString());
    }

    remove(principalKey: PrincipalKey): void {
        delete this.entries[principalKey.toString()];
    }

    addAll(entries: IdProviderAccessControlEntry[]): void {
        entries.forEach((entry) => {
            this.entries[entry.getPrincipal().getKey().toString()] = entry;
        });
    }

    toString(): string {
        return '[' + this.getEntries().sort().map((ace) => ace.toString()).join(', ') + ']';
    }

    toJson(): IdProviderAccessControlEntryJson[] {
        let acl: IdProviderAccessControlEntryJson[] = [];
        this.getEntries().forEach((entry: IdProviderAccessControlEntry) => {
            let entryJson = entry.toJson();
            acl.push(entryJson);
        });
        return acl;
    }

    equals(o: Equitable): boolean {

        if (!ObjectHelper.iFrameSafeInstanceOf(o, IdProviderAccessControlList)) {
            return false;
        }

        let other = <IdProviderAccessControlList>o;
        return this.toString() === other.toString();
    }

    clone(): IdProviderAccessControlList {
        let result = new IdProviderAccessControlList();
        this.getEntries().forEach((item) => {
            let clonedItem = new IdProviderAccessControlEntry(item.getPrincipal().clone(), item.getAccess());
            result.add(clonedItem);
        });

        return result;
    }
}
