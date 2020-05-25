import {ListGraphQlRequest} from '../ListGraphQlRequest';
import {UserItemAggregationHelper} from '../aggregation/UserItemAggregationHelper';
import {UserItemBucketAggregationJson} from '../aggregation/UserItemBucketAggregationJson';
import {BucketAggregation} from 'lib-admin-ui/aggregation/BucketAggregation';

export class ListTypesRequest
    extends ListGraphQlRequest<any> {

    private searchQuery: string;

    private itemIds: string[];

    setQuery(query: string): ListTypesRequest {
        this.searchQuery = query;
        return this;
    }

    setItems(items: string[]): ListTypesRequest {
        this.itemIds = items;
        return this;
    }

    getVariables(): { [key: string]: any } {
        const vars = super.getVariables();

        if (this.searchQuery) {
            vars['query'] = this.searchQuery;
        }

        if (this.itemIds && this.itemIds.length > 0) {
            vars['itemIds'] = this.itemIds;
        }

        return vars;
    }

    getQuery(): string {
        return `query ($query: String, $itemIds: [String], $start: Int, $count: Int) {
                    types (query: $query, itemIds: $itemIds, start: $start, count: $count) {
                        totalCount
                        aggregations {
                            name,
                            buckets {
                                key,
                                docCount
                            }
                        }
                    }
                }`;
    }

    sendAndParse(): Q.Promise<BucketAggregation> {
        return this.query().then((response: any) => {
            const data = response.types;
            return this.fromJsonToAggregation(data.aggregations);
        });
    }

    private fromJsonToAggregation(jsons: UserItemBucketAggregationJson[]): BucketAggregation {
        if (!jsons || jsons.length < 1) {
            return null;
        }

        const typeJson = jsons.filter(json => json.name === 'principalType')[0];

        const typeAggregation = typeJson ? UserItemAggregationHelper.fromJson(typeJson) : new BucketAggregation('principalType');
        UserItemAggregationHelper.updatePrincipalTypeAggregation(typeAggregation);

        return typeAggregation;
    }
}
