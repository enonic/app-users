import {ListGraphQlRequest} from '../ListGraphQlRequest';
import {FulltextSearchExpression} from 'lib-admin-ui/query/FulltextSearchExpression';

export abstract class ListItemsRequest
    extends ListGraphQlRequest<any> {

    protected searchQuery: string;

    protected itemIds: string[];

    setQuery(query: string): ListItemsRequest {
        this.searchQuery = query;
        return this;
    }

    setItems(items: string[]): ListItemsRequest {
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
