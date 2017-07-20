import '../../../api.ts';
import {ListTypesRequest, TypeAggregation} from '../../../api/graphql/principal/ListTypesRequest';
import AggregationGroupView = api.aggregation.AggregationGroupView;

export class PrincipalTypeAggregationGroupView extends AggregationGroupView {

    initialize() {

        const displayNameMap: {[name:string]:string} = {};

        const mask: api.ui.mask.LoadMask = new api.ui.mask.LoadMask(this);
        this.appendChild(mask);
        this.onRendered(() => mask.show());

        const request = new ListTypesRequest();
        request.sendAndParse().done((data: TypeAggregation[]) => {
            data.forEach((value: TypeAggregation) => {
                displayNameMap[value.type] = value.type;
            });

            this.getAggregationViews().forEach((aggregationView: api.aggregation.AggregationView) => {
                aggregationView.setDisplayNamesMap(displayNameMap);
            });

            mask.remove();
        });
    }
}
