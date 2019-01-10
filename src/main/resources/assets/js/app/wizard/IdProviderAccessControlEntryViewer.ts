import PrincipalType = api.security.PrincipalType;
import {IdProviderAccessControlEntry} from '../access/IdProviderAccessControlEntry';

export class IdProviderAccessControlEntryViewer
    extends api.ui.NamesAndIconViewer<IdProviderAccessControlEntry> {

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
