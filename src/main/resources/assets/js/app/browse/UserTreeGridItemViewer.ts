import '../../api.ts';
import {UserTreeGridItem, UserTreeGridItemType} from './UserTreeGridItem';
import i18n = api.util.i18n;

export class UserTreeGridItemViewer extends api.ui.NamesAndIconViewer<UserTreeGridItem> {

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

    resolveSubName(object: UserTreeGridItem, relativePath: boolean = false): string {

        if (object.getType() != null) {
            switch (object.getType()) {
                case UserTreeGridItemType.USER_STORE:
                    return ('/' + object.getIdProvider().getKey().toString());
                case UserTreeGridItemType.PRINCIPAL:
                    return relativePath ? object.getPrincipal().getKey().getId() :
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
            case UserTreeGridItemType.USER_STORE:
                if (object.getIdProvider().getKey().isSystem()) {
                    iconClass += 'icon-system ';
                }
                return iconClass + 'icon-address-book';
            case UserTreeGridItemType.PRINCIPAL:
                if (object.getPrincipal().isRole()) {
                    return iconClass + 'icon-masks';
                }
                if (object.getPrincipal().isGroup()) {
                    return iconClass + 'icon-users';
                }
                if (object.getPrincipal().isSystemUser()) {
                    iconClass += 'icon-system ';
                }
                return iconClass + 'icon-user';

            default:
                return iconClass + 'icon-folder';
        }
    }
}
