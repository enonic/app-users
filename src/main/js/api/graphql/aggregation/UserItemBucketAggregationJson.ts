import BucketAggregation = api.aggregation.BucketAggregation;
import BucketJson = api.aggregation.BucketJson;

export interface UserItemBucketAggregationJson {
    name: string;
    buckets: BucketJson[];
}
