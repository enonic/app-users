import {ListGraphQlRequest} from '../ListGraphQlRequest';
import {UserItemAggregationHelper} from '../aggregation/UserItemAggregationHelper';
import {UserItemBucketAggregationJson} from '../aggregation/UserItemBucketAggregationJson';
import {BucketAggregation} from 'lib-admin-ui/aggregation/BucketAggregation';
import {ListTypesResult} from './ListTypesResult';

export class ListTypesRequest
    extends ListGraphQlRequest<any, ListTypesResult> {

    private searchQuery: string;

    setQuery(query: string): ListTypesRequest {
        this.searchQuery = query;
        return this;
    }

    getVariables(): { [key: string]: any } {
        let vars = super.getVariables();

        if (this.searchQuery) {
            vars['query'] = this.searchQuery;
        }

        return vars;
    }

    getQuery(): string {
        return `query ($query: String, $start: Int, $count: Int) {
                    types (query: $query, start: $start, count: $count) {
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

    sendAndParse(): Q.Promise<ListTypesResult> {
        return this.query().then((response: any) => {
            const data = response.types;
            const aggregation: BucketAggregation = this.fromJsonToAggregation(data.aggregations);
            return new ListTypesResult(aggregation, data.totalCount);
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
