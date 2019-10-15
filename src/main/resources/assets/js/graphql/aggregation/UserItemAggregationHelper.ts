import {BucketAggregation} from 'lib-admin-ui/aggregation/BucketAggregation';
import {BucketJson} from 'lib-admin-ui/aggregation/BucketJson';
import {Bucket} from 'lib-admin-ui/aggregation/Bucket';
import {StringHelper} from 'lib-admin-ui/util/StringHelper';
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
