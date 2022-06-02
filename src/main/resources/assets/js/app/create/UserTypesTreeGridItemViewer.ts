import {UserTypeTreeGridItem} from './UserTypeTreeGridItem';
import {IdProvider} from '../principal/IdProvider';
import {User} from '../principal/User';
import {Group} from '../principal/Group';
import {Role} from '../principal/Role';
import {NamesAndIconViewer} from '@enonic/lib-admin-ui/ui/NamesAndIconViewer';

export class UserTypesTreeGridItemViewer
    extends NamesAndIconViewer<UserTypeTreeGridItem> {

    private rootViewer: boolean;

    constructor(rootViewer: boolean = true) {
        super(rootViewer ? 'root-viewer' : '');

        this.rootViewer = rootViewer;
    }

    resolveDisplayName(object: UserTypeTreeGridItem): string {
        return object.getUserItem().getDisplayName();
    }

    resolveSubName(object: UserTypeTreeGridItem, relativePath: boolean = false): string {
        return this.rootViewer ? '' : ('/' + object.getUserItem().getKey().toString());
    }

    resolveIconClass(object: UserTypeTreeGridItem): string {
        const userItem = object.getUserItem();
        if (userItem instanceof IdProvider) {
            return 'icon-address-book icon-large';
        } else if (userItem instanceof User) {
            return 'icon-user icon-large';
        } else if (userItem instanceof Group) {
            return 'icon-users icon-large';
        } else if (userItem instanceof Role) {
            return 'icon-masks icon-large';
        }
        return '';
    }
}
