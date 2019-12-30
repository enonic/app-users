import {PrincipalType} from 'lib-admin-ui/security/PrincipalType';
import {IdProviderAccessControlEntry} from '../access/IdProviderAccessControlEntry';
import {NamesAndIconViewer} from 'lib-admin-ui/ui/NamesAndIconViewer';

export class IdProviderAccessControlEntryViewer
    extends NamesAndIconViewer<IdProviderAccessControlEntry> {

    constructor() {
        super();
    }

    resolveDisplayName(object: IdProviderAccessControlEntry): string {
        return object.getPrincipalDisplayName();
    }

    resolveUnnamedDisplayName(object: IdProviderAccessControlEntry): string {
        return object.getPrincipalTypeName();
    }

    resolveSubName(object: IdProviderAccessControlEntry): string {
        return object.getPrincipalKey().toPath();
    }

    resolveIconClass(object: IdProviderAccessControlEntry): string {
        switch (object.getPrincipal().getKey().getType()) {
        case PrincipalType.USER:
            return 'icon-user';
        case PrincipalType.GROUP:
            return 'icon-users';
        case PrincipalType.ROLE:
            return 'icon-masks';
        }

        return '';
    }
}
