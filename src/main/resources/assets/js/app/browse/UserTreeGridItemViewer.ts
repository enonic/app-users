import {UserTreeGridItem, UserTreeGridItemType} from './UserTreeGridItem';
import {NamesAndIconViewer} from '@enonic/lib-admin-ui/ui/NamesAndIconViewer';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';

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
        return object.getIconClass('icon-large');
    }
}
