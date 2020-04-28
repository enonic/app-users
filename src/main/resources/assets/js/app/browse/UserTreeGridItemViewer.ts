import {UserTreeGridItem, UserTreeGridItemType} from './UserTreeGridItem';
import {NamesAndIconViewer} from 'lib-admin-ui/ui/NamesAndIconViewer';
import {i18n} from 'lib-admin-ui/util/Messages';

export class UserTreeGridItemViewer
    extends NamesAndIconViewer<UserTreeGridItem> {

    constructor() {
        super();
    }

    resolveDisplayName(object: UserTreeGridItem): string {
        return object.getItemDisplayName();
    }

    resolveUnnamedDisplayName(object: UserTreeGridItem): string {
        return object.getPrincipal() ? object.getPrincipal().getTypeName()
                                     : object.getIdProvider() ? i18n('field.idProvider') : '';
    }

    resolveSubName(object: UserTreeGridItem): string {

        if (object.getType() != null) {
            switch (object.getType()) {
            case UserTreeGridItemType.ID_PROVIDER:
                    return ('/' + object.getIdProvider().getKey().toString());
                case UserTreeGridItemType.PRINCIPAL:
                    return this.isRelativePath ? object.getPrincipal().getKey().getId() :
                           object.getPrincipal().getKey().toPath();
                default:
                    return object.getItemDisplayName().toLocaleLowerCase();
            }
        }
        return '';
    }

    resolveIconClass(object: UserTreeGridItem): string {
        let iconClass = 'icon-large ';

        switch (object.getType()) {
        case UserTreeGridItemType.ID_PROVIDER:
            if (object.getIdProvider().getKey().isSystem()) {
                iconClass += 'icon-system ';
            }
            return iconClass + 'icon-address-book';
        case UserTreeGridItemType.PRINCIPAL:
            if (object.getPrincipal().isSystem()) {
                iconClass += 'icon-system ';
            }

            if (object.getPrincipal().isRole()) {
                return iconClass + 'icon-masks';
            }
            if (object.getPrincipal().isGroup()) {
                return iconClass + 'icon-users';
            }
            return iconClass + 'icon-user';

            default:
                return iconClass + 'icon-folder';
        }
    }
}
