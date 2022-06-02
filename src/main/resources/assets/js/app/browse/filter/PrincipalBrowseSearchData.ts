import {UserItemType} from '../UserItemType';
import {UserItem} from '@enonic/lib-admin-ui/security/UserItem';

export class PrincipalBrowseSearchData {

    private searchString: string;
    private types: UserItemType[];
    private userItems: UserItem[];

    constructor(searchString: string, types: UserItemType[], userItems: UserItem[]) {
        this.searchString = searchString;
        this.types = types;
        this.userItems = userItems;
    }

    getSearchString(): string {
        return this.searchString;
    }

    getTypes(): UserItemType[] {
        return this.types;
    }

    getUserItems(): UserItem[] {
        return this.userItems;
    }
}
