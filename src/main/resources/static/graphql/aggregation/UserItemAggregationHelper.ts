import {BucketAggregation} from '@enonic/lib-admin-ui/aggregation/BucketAggregation';
import {BucketJson} from '@enonic/lib-admin-ui/aggregation/BucketJson';
import {Bucket} from '@enonic/lib-admin-ui/aggregation/Bucket';
import {StringHelper} from '@enonic/lib-admin-ui/util/StringHelper';
import {UserItemBucketAggregationJson} from './UserItemBucketAggregationJson';

export class UserItemAggregationHelper {

    static fromJson(json: UserItemBucketAggregationJson): BucketAggregation {
        const agg = new BucketAggregation(json.name);
        json.buckets.forEach((bucketJson: BucketJson) => agg.addBucket(new Bucket(bucketJson.key, bucketJson.docCount)));
        return agg;
    }

    static updatePrincipalTypeAggregation(aggregation: BucketAggregation): void {
        if (aggregation) {
            aggregation.getBuckets().forEach(bucket => bucket.setKey(StringHelper.capitalize(bucket.getKey())));
        }
    }
}
