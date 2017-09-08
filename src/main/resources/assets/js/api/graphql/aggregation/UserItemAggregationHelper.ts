import BucketAggregation = api.aggregation.BucketAggregation;
import {UserItemBucketAggregationJson} from './UserItemBucketAggregationJson';
import BucketJson = api.aggregation.BucketJson;
import Bucket = api.aggregation.Bucket;
import StringHelper = api.util.StringHelper;

export class UserItemAggregationHelper {

    static fromJson(json: UserItemBucketAggregationJson): BucketAggregation {
        const agg = new BucketAggregation(json.name);
        json.buckets.forEach((bucketJson: BucketJson) => agg.addBucket(new Bucket(bucketJson.key, bucketJson.docCount)));
        return agg;
    }

    static updatePrincipalTypeAggregation(aggregation: BucketAggregation, total: number) {
        if (aggregation) {
            const typeAggBuckets = aggregation.getBuckets();

            const principalsCount = typeAggBuckets.length > 1 ?
                                    typeAggBuckets.reduce((prev: number, curr: Bucket) => prev + curr.getDocCount(), 0) :
                                    (typeAggBuckets[0] && typeAggBuckets[0].getDocCount() || 0);
            const userStoresDocCount = total - principalsCount;

            typeAggBuckets.forEach(bucket => bucket.setKey(StringHelper.capitalize(bucket.getKey())));
            aggregation.addBucket(new Bucket('User Store', userStoresDocCount));
        }
    }
}
