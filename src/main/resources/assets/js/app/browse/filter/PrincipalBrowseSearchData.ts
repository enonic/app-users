import {UserItemType} from '../UserItemType';

export class PrincipalBrowseSearchData {

    private searchString: string;
    private types: UserItemType[];
    private itemIds: string[];

    constructor(searchString: string, types: UserItemType[], itemIds: string[]) {
        this.searchString = searchString;
        this.types = types;
        this.itemIds = itemIds;
    }

    getSearchString(): string {
        return this.searchString;
    }

    getTypes(): UserItemType[] {
        return this.types;
    }

    getItemIds(): string[] {
        return this.itemIds;
    }
}
