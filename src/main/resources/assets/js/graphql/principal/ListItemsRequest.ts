import {ListGraphQlProperties, ListGraphQlRequest} from '../ListGraphQlRequest';
import {FulltextSearchExpression} from '@enonic/lib-admin-ui/query/FulltextSearchExpression';

export interface ListItemsProperties extends ListGraphQlProperties {
    query: string;
    itemsIds: string[];
}

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

    getVariables(): ListItemsProperties {
        const vars = super.getVariables() as ListItemsProperties;

        if (this.searchQuery) {
            vars['query'] = FulltextSearchExpression.escapeString(this.searchQuery);
        }

        if (this.itemIds && this.itemIds.length > 0) {
            vars['itemIds'] = this.itemIds;
        }

        return vars;
    }

}
