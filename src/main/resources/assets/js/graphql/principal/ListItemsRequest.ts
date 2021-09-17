import {ListGraphQlRequest} from '../ListGraphQlRequest';
import {FulltextSearchExpression} from 'lib-admin-ui/query/FulltextSearchExpression';

export abstract class ListItemsRequest<TYPE>
    extends ListGraphQlRequest<TYPE> {

    protected searchQuery: string;

    protected itemIds: string[];

    setQuery(query: string): ListItemsRequest<TYPE> {
        this.searchQuery = query;
        return this;
    }

    setItems(items: string[]): ListItemsRequest<TYPE> {
        this.itemIds = items;
        return this;
    }

    getVariables(): { [key: string]: any } {
        const vars = super.getVariables();

        if (this.searchQuery) {
            vars['query'] = FulltextSearchExpression.escapeString(this.searchQuery);
        }

        if (this.itemIds && this.itemIds.length > 0) {
            vars['itemIds'] = this.itemIds;
        }

        return vars;
    }

}
