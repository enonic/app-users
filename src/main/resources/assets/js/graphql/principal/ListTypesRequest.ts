import {UserItemAggregationHelper} from '../aggregation/UserItemAggregationHelper';
import {UserItemBucketAggregationJson} from '../aggregation/UserItemBucketAggregationJson';
import {BucketAggregation} from 'lib-admin-ui/aggregation/BucketAggregation';
import {ListItemsRequest} from './ListItemsRequest';

export class ListTypesRequest
    extends ListItemsRequest<BucketAggregation> {

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
