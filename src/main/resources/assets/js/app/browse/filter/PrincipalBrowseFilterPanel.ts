import '../../../api.ts';
import {UserTreeGridItem} from '../UserTreeGridItem';
import {ListUserItemsRequest, ListUserItemsRequestResult} from '../../../api/graphql/principal/ListUserItemsRequest';
import {UserItemType} from '../UserItemType';
import {PrincipalBrowseSearchData} from './PrincipalBrowseSearchData';
import {ListTypesRequest} from '../../../api/graphql/principal/ListTypesRequest';
import BrowseFilterResetEvent = api.app.browse.filter.BrowseFilterResetEvent;
import BrowseFilterSearchEvent = api.app.browse.filter.BrowseFilterSearchEvent;
import AggregationGroupView = api.aggregation.AggregationGroupView;
import AggregationSelection = api.aggregation.AggregationSelection;
import Aggregation = api.aggregation.Aggregation;
import BucketAggregation = api.aggregation.BucketAggregation;
import Bucket = api.aggregation.Bucket;
import i18n = api.util.i18n;
import StringHelper = api.util.StringHelper;

export class PrincipalBrowseFilterPanel
    extends api.app.browse.filter.BrowseFilterPanel<UserTreeGridItem> {

    static PRINCIPAL_TYPE_AGGREGATION_NAME: string = 'principalType';
    static PRINCIPAL_TYPE_AGGREGATION_DISPLAY_NAME: string = i18n('field.types');

    private principalTypeAggregationGroupView: AggregationGroupView;

    constructor() {
        super();

        this.fetchAndUpdateAggregations();
        this.initHitsCounter();
    }

    private initHitsCounter() {
        new ListUserItemsRequest().sendAndParse().then((result: ListUserItemsRequestResult) => {
            this.updateHitsCounter(result.userItems ? result.userItems.length : 0, true);
        }).catch((reason: any) => {
            api.DefaultErrorHandler.handle(reason);
        });
    }

    protected getGroupViews(): api.aggregation.AggregationGroupView[] {
        this.principalTypeAggregationGroupView = new AggregationGroupView(
            PrincipalBrowseFilterPanel.PRINCIPAL_TYPE_AGGREGATION_NAME,
            PrincipalBrowseFilterPanel.PRINCIPAL_TYPE_AGGREGATION_DISPLAY_NAME
        );

        return [this.principalTypeAggregationGroupView];
    }

    doRefresh(): wemQ.Promise<void> {
        if (!this.isFilteredOrConstrained()) {
            return this.resetFacets(true);
        }

        return this.refreshDataAndHandleResponse();
    }

    protected doSearch(): wemQ.Promise<void> {
        if (!this.isFilteredOrConstrained()) {
            return this.reset();
        }

        return this.searchDataAndHandleResponse();
    }

    protected resetFacets(suppressEvent?: boolean, doResetAll?: boolean): wemQ.Promise<void> {
        return new ListUserItemsRequest().sendAndParse().then((result: ListUserItemsRequestResult) => {
            return this.fetchAndUpdateAggregations().then(() => {
                const userItems = result.userItems;
                this.updateHitsCounter(userItems ? userItems.length : 0, true);
                this.toggleAggregationsVisibility(result.aggregations);

                // then fire usual reset event with content grid reloading
                if (!suppressEvent) {
                    new BrowseFilterResetEvent().fire();
                }
            });
        }).catch((reason: any) => {
            api.DefaultErrorHandler.handle(reason);
        });
    }

    private hasSelectedAggregations(): boolean {
        const selections: AggregationSelection[] = this.getSearchInputValues().aggregationSelections || [];
        return selections.some(selection => selection.getSelectedBuckets().length > 0);
    }

    private getCheckedTypes(): UserItemType[] {
        const values = this.getSearchInputValues();
        const aggregationType = PrincipalBrowseFilterPanel.PRINCIPAL_TYPE_AGGREGATION_NAME;
        const selectedBuckets: Bucket[] = values.getSelectedValuesForAggregationName(aggregationType) || [];
        return selectedBuckets
            .map(bucket => UserItemType[bucket.getKey().replace(/\s/g, '_').toUpperCase()])
            .filter(type => type != null);
    }

    private searchDataAndHandleResponse(): wemQ.Promise<void> {
        const types: UserItemType[] = this.getCheckedTypes();
        const searchString: string = this.getSearchInputValues().getTextSearchFieldValue();

        return new ListUserItemsRequest().setTypes(types).setQuery(searchString).sendAndParse()
            .then((result: ListUserItemsRequestResult) => {
                this.handleDataSearchResult(result, types, searchString);
            }).catch((reason: any) => {
                api.DefaultErrorHandler.handle(reason);
            });
    }

    private refreshDataAndHandleResponse(): wemQ.Promise<void> {
        const types: UserItemType[] = this.getCheckedTypes();
        const searchString: string = this.getSearchInputValues().getTextSearchFieldValue();

        return new ListUserItemsRequest().setTypes(types).setQuery(searchString).sendAndParse()
            .then((result: ListUserItemsRequestResult) => {
                if (result.userItems.length > 0) {
                    this.handleDataSearchResult(result, types, searchString);
                } else {
                    this.handleNoSearchResultOnRefresh();
                }
            }).catch((reason: any) => {
                api.DefaultErrorHandler.handle(reason);
            });
    }

    private handleDataSearchResult(result: ListUserItemsRequestResult, types: UserItemType[], searchString: string) {
        this.fetchAndUpdateAggregations().then(() => {
            let userItems = result.userItems;

            if (this.hasConstraint()) {
                const principalKeys = this.getSelectionItems().map(key => key.getDataId());
                userItems = userItems.filter(principal => principalKeys.some(pr => pr === principal.getKey().toString()));
            }

            new BrowseFilterSearchEvent(new PrincipalBrowseSearchData(searchString, types, userItems)).fire();

            this.updateHitsCounter(userItems ? userItems.length : 0, api.util.StringHelper.isBlank(searchString));
            this.toggleAggregationsVisibility(result.aggregations);
        });
    }

    private handleNoSearchResultOnRefresh() {
        if (this.hasSearchStringSet()) { // if still no result and search text is set remove last modified facet
            this.deselectAll();
            return this.searchDataAndHandleResponse();
        }

        return this.reset();
    }

    private toggleAggregationsVisibility(aggregations: Aggregation[]) {
        aggregations.forEach((aggregation: api.aggregation.BucketAggregation) => {
            const aggregationIsEmpty = !aggregation.getBuckets().some(bucket => bucket.docCount > 0);

            const isTypeAggregation = aggregation.getName() === PrincipalBrowseFilterPanel.PRINCIPAL_TYPE_AGGREGATION_NAME;
            if (isTypeAggregation) {
                this.principalTypeAggregationGroupView.setVisible(!aggregationIsEmpty);
            }
        });
    }

    private fetchAndUpdateAggregations(): wemQ.Promise<void> {
        return new ListTypesRequest()
            .sendAndParse()
            .then((typeAggregation) => {
                this.updateAggregations([typeAggregation], true);
                this.toggleAggregationsVisibility([typeAggregation]);
            }).catch((reason: any) => {
                api.DefaultErrorHandler.handle(reason);
            });
    }

    updateAggregations(aggregations: api.aggregation.BucketAggregation[], doUpdateAll?: boolean) {
        this.initPrincipalTypeBuckets(aggregations);

        super.updateAggregations(aggregations, doUpdateAll);
    }

    private getPrincipalTypeDisplayName(key: string) {
        switch (key.toLowerCase()) {
            case 'user': return i18n('field.user');
            case 'group': return i18n('field.group');
            case 'role': return i18n('field.role');
            case 'user store': return i18n('field.userStore');
            default: StringHelper.capitalize(name);
        }
    }

    private initPrincipalTypeBuckets(aggregations: BucketAggregation[]) {
        const principalTypeAggregation: BucketAggregation =
            aggregations.filter(
                aggregation => aggregation.getName() === PrincipalBrowseFilterPanel.PRINCIPAL_TYPE_AGGREGATION_NAME
            )[0];

        if (!principalTypeAggregation) {
            return;
        }

        const buckets = principalTypeAggregation.getBuckets();
        buckets.forEach(bucket => bucket.setDisplayName(this.getPrincipalTypeDisplayName(bucket.getKey())));

        this.sortPrincipalTypeBuckets(principalTypeAggregation);

    }

    private sortPrincipalTypeBuckets(principalTypeAggregation: BucketAggregation) {
        const sortedBuckets = principalTypeAggregation.getBuckets().sort((b1: Bucket, b2: Bucket) => {
            const bucketName1 = this.getPrincipalTypeDisplayName(b1.getKey());
            const bucketName2 = this.getPrincipalTypeDisplayName(b2.getKey());

            return (bucketName1 < bucketName2) ? -1 : 1;
        });

        principalTypeAggregation.setBuckets(sortedBuckets);
    }

}
