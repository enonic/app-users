import '../../../api.ts';
import {ListTypesRequest} from '../../../api/graphql/principal/ListTypesRequest';
import AggregationGroupView = api.aggregation.AggregationGroupView;
import BucketAggregation = api.aggregation.BucketAggregation;
import Bucket = api.aggregation.Bucket;
import i18n = api.util.i18n;
import StringHelper = api.util.StringHelper;

export class PrincipalTypeAggregationGroupView extends AggregationGroupView {

    initialize() {

        const displayNameMap: {[name:string]:string} = {};

        const mask: api.ui.mask.LoadMask = new api.ui.mask.LoadMask(this);
        this.appendChild(mask);
        this.onRendered(() => mask.show());

        const request = new ListTypesRequest();
        request.sendAndParse().done((data: BucketAggregation) => {
            data.getBuckets().forEach((bucket: Bucket) => {
                const key = bucket.getKey().toLowerCase();
                displayNameMap[key] = this.getTypeName(key);
            });

            this.getAggregationViews().forEach((aggregationView: api.aggregation.AggregationView) => {
                aggregationView.setDisplayNamesMap(displayNameMap);
            });

            mask.remove();
        });
    }

    private getTypeName(name: string): string {
        switch (name) {
        case 'user': return i18n('field.user');
        case 'group': return i18n('field.group');
        case 'role': return i18n('field.role');
        case 'user store': return i18n('field.userStore');
        default: StringHelper.capitalize(name);
        }
    }
}
