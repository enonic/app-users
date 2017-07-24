import '../../../api.ts';
import {ListTypesRequest} from '../../../api/graphql/principal/ListTypesRequest';
import AggregationGroupView = api.aggregation.AggregationGroupView;
import BucketAggregation = api.aggregation.BucketAggregation;
import Bucket = api.aggregation.Bucket;

export class PrincipalTypeAggregationGroupView extends AggregationGroupView {

    initialize() {

        const displayNameMap: {[name:string]:string} = {};

        const mask: api.ui.mask.LoadMask = new api.ui.mask.LoadMask(this);
        this.appendChild(mask);
        this.onRendered(() => mask.show());

        const request = new ListTypesRequest();
        request.sendAndParse().done((data: BucketAggregation) => {
            data.getBuckets().forEach((bucket: Bucket) => {
                displayNameMap[bucket.getKey().replace(/\s/g, '_').toUpperCase()] = bucket.getKey();
            });

            this.getAggregationViews().forEach((aggregationView: api.aggregation.AggregationView) => {
                aggregationView.setDisplayNamesMap(displayNameMap);
            });

            mask.remove();
        });
    }
}
