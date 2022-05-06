import {UserItemAggregationHelper} from '../aggregation/UserItemAggregationHelper';
import {UserItemBucketAggregationJson} from '../aggregation/UserItemBucketAggregationJson';
import {BucketAggregation} from 'lib-admin-ui/aggregation/BucketAggregation';
import {ListItemsRequest} from './ListItemsRequest';

type ListTypeData = {
    types: {
        totalCount: number;
        aggregations: UserItemBucketAggregationJson[];
    };
};

export class ListTypesRequest
    extends ListItemsRequest<BucketAggregation> {

    constructor(){
        super();
        // No need to go through everything since the only data used in the response is from aggregations
        this.setCount(1);
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
        return this.query().then((response: ListTypeData) => {
            return this.fromJsonToAggregation(response.types.aggregations);
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
