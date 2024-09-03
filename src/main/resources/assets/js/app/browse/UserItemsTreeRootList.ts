import {UserItemsTreeList} from './UserItemsTreeList';
import {UserItemType} from './UserItemType';
import * as Q from 'q';
import {UserTreeGridItem, UserTreeGridItemBuilder} from './UserTreeGridItem';
import {ListUserItemsRequest} from '../../graphql/principal/ListUserItemsRequest';

export class UserItemsTreeRootList extends UserItemsTreeList {

    private searchString: string;
    private searchTypes: UserItemType[];

    setSearchString(searchString: string): this {
        this.searchString = searchString;
        return this;
    }

    setSearchTypes(searchTypes: UserItemType[]): this {
        this.searchTypes = searchTypes;
        return this;
    }

    isFiltered(): boolean {
        return !!this.searchString || !!this.searchTypes;
    }

    resetFilter(): void {
        this.searchString = null;
        this.searchTypes = null;
        this.load();
    }

    protected fetchRoot(): Q.Promise<UserTreeGridItem[]> {
        if (this.isFiltered()) {
            return this.fetchFilteredItems();
        }

        return super.fetchRoot();
    }

    private fetchFilteredItems(): Q.Promise<UserTreeGridItem[]> {
        return new ListUserItemsRequest().setCount(20).setTypes(this.searchTypes).setQuery(this.searchString).setStart(
            this.getItemCount()).sendAndParse()
            .then((result) => {
                return result.userItems.map(item => new UserTreeGridItemBuilder().setAny(item).build());
            });
    }


}
