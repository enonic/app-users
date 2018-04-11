import '../../../api.ts';
import {UserItemType} from '../UserItemType';
import UserItem = api.security.UserItem;

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

    getUserItems(): api.security.UserItem[] {
        return this.userItems;
    }
}
