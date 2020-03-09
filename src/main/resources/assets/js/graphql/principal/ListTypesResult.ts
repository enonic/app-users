import {BucketAggregation} from 'lib-admin-ui/aggregation/BucketAggregation';

export class ListTypesResult {

    private total: number;

    private bucketAggregation: BucketAggregation;

    constructor(bucketAggregation: BucketAggregation, total: number) {
        this.bucketAggregation = bucketAggregation;
        this.total = total;
    }

    getBucketAggregation(): BucketAggregation {
        return this.bucketAggregation;
    }

    getTotal(): number {
        return this.total;
    }

}
