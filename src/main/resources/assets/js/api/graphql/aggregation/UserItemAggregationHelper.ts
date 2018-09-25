import BucketAggregation = api.aggregation.BucketAggregation;
import BucketJson = api.aggregation.BucketJson;
import Bucket = api.aggregation.Bucket;
import StringHelper = api.util.StringHelper;
import {UserItemBucketAggregationJson} from './UserItemBucketAggregationJson';

export class UserItemAggregationHelper {

    static fromJson(json: UserItemBucketAggregationJson): BucketAggregation {
        const agg = new BucketAggregation(json.name);
        json.buckets.forEach((bucketJson: BucketJson) => agg.addBucket(new Bucket(bucketJson.key, bucketJson.docCount)));
        return agg;
    }

    static updatePrincipalTypeAggregation(aggregation: BucketAggregation) {
        if (aggregation) {
            aggregation.getBuckets().forEach(bucket => bucket.setKey(StringHelper.capitalize(bucket.getKey())));
        }
    }
}
