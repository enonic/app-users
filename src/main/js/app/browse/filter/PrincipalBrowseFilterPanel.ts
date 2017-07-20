import '../../../api.ts';
import {UserTreeGridItem} from '../UserTreeGridItem';
import {PrincipalTypeAggregationGroupView} from './PrincipalTypeAggregationGroupView';
import {ListUserItemsRequest} from '../../../api/graphql/principal/ListUserItemsRequest';
import AggregationGroupView = api.aggregation.AggregationGroupView;
import SearchInputValues = api.query.SearchInputValues;
import Principal = api.security.Principal;
import PrincipalType = api.security.PrincipalType;
import BrowseFilterResetEvent = api.app.browse.filter.BrowseFilterResetEvent;
import BrowseFilterSearchEvent = api.app.browse.filter.BrowseFilterSearchEvent;
import QueryExpr = api.query.expr.QueryExpr;
import CompareExpr = api.query.expr.CompareExpr;
import LogicalExpr = api.query.expr.LogicalExpr;
import ValueExpr = api.query.expr.ValueExpr;
import LogicalOperator = api.query.expr.LogicalOperator;
import LogicalExp = api.query.expr.LogicalExpr;
import FieldExpr = api.query.expr.FieldExpr;
import QueryField = api.query.QueryField;
import i18n = api.util.i18n;
import Aggregation = api.aggregation.Aggregation;

export class PrincipalBrowseFilterPanel
    extends api.app.browse.filter.BrowseFilterPanel<UserTreeGridItem> {

    static PRINCIPAL_TYPE_AGGREGATION_NAME: string = 'principalTypes';
    static PRINCIPAL_TYPE_AGGREGATION_DISPLAY_NAME: string = i18n('field.principalTypes');

    private principalTypeAggregation: PrincipalTypeAggregationGroupView;

    constructor() {
        super();

        this.initAggregationGroupView([this.principalTypeAggregation]);
        this.initHitsCounter();
    }

    protected getGroupViews(): api.aggregation.AggregationGroupView[] {
        this.principalTypeAggregation = new PrincipalTypeAggregationGroupView(
            PrincipalBrowseFilterPanel.PRINCIPAL_TYPE_AGGREGATION_NAME,
            PrincipalBrowseFilterPanel.PRINCIPAL_TYPE_AGGREGATION_DISPLAY_NAME);

        return [this.principalTypeAggregation];
    }

    private initAggregationGroupView(aggregationGroupViews: AggregationGroupView[]) {
        aggregationGroupViews.forEach(aggregation => aggregation.initialize());
    }

    doRefresh() {
        this.searchFacets(true);
    }

    doSearch(elementChanged?: api.dom.Element) {
        this.searchFacets();
    }

    protected resetFacets(supressEvent?: boolean, doResetAll?: boolean) {
        this.searchDataAndHandleResponse('', false);

        // then fire usual reset event with content grid reloading
        if (!supressEvent) {
            new BrowseFilterResetEvent().fire();
        }
    }

    private searchFacets(isRefresh: boolean = false) {
        let values = this.getSearchInputValues();
        let searchText = values.getTextSearchFieldValue();
        if (!searchText && !this.hasConstraint()) {
            this.handleEmptyFilterInput(isRefresh);
            return;
        }

        this.searchDataAndHandleResponse(searchText);
    }

    private handleEmptyFilterInput(isRefresh: boolean) {
        if (isRefresh) {
            this.resetFacets(true);
        } else {
            this.reset();
        }
    }

    private searchDataAndHandleResponse(searchString: string, fireEvent: boolean = true) {

        new ListUserItemsRequest()
            .setQuery(searchString)
            .sendAndParse()
            .then((result) => {
                let userItems = result.userItems;

                if (this.hasConstraint()) {
                    let principalKeys = this.getSelectionItems().map(key => key.getDataId());
                    userItems = userItems.filter(principal => principalKeys.some(pr => pr === principal.getKey().toString()));
                }

                if (fireEvent) {
                    new BrowseFilterSearchEvent(userItems).fire();
                }
                this.updateHitsCounter(userItems ? userItems.length : 0, api.util.StringHelper.isBlank(searchString));
            }).catch((reason: any) => {
            api.DefaultErrorHandler.handle(reason);
        }).done();
    }

    private initHitsCounter() {
        this.searchDataAndHandleResponse('', false);
    }

}
