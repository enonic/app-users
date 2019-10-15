import {BucketJson} from 'lib-admin-ui/aggregation/BucketJson';

export interface UserItemBucketAggregationJson {
    name: string;
    buckets: BucketJson[];
}
