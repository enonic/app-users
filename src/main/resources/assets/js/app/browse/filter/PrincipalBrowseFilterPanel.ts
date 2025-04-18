import {UserTreeGridItem} from '../UserTreeGridItem';
import {ListUserItemsRequest, ListUserItemsRequestResult} from '../../../graphql/principal/ListUserItemsRequest';
import {UserItemType} from '../UserItemType';
import {PrincipalBrowseSearchData} from './PrincipalBrowseSearchData';
import {ListTypesRequest} from '../../../graphql/principal/ListTypesRequest';
import {BrowseFilterResetEvent} from '@enonic/lib-admin-ui/app/browse/filter/BrowseFilterResetEvent';
import {BrowseFilterSearchEvent} from '@enonic/lib-admin-ui/app/browse/filter/BrowseFilterSearchEvent';
import {AggregationGroupView} from '@enonic/lib-admin-ui/aggregation/AggregationGroupView';
import {AggregationSelection} from '@enonic/lib-admin-ui/aggregation/AggregationSelection';
import {Aggregation} from '@enonic/lib-admin-ui/aggregation/Aggregation';
import {BucketAggregation} from '@enonic/lib-admin-ui/aggregation/BucketAggregation';
import {Bucket} from '@enonic/lib-admin-ui/aggregation/Bucket';
import {StringHelper} from '@enonic/lib-admin-ui/util/StringHelper';
import {BrowseFilterPanel} from '@enonic/lib-admin-ui/app/browse/filter/BrowseFilterPanel';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {UserItem} from '@enonic/lib-admin-ui/security/UserItem';
import {SearchInputValues} from '@enonic/lib-admin-ui/query/SearchInputValues';
import {Exception} from '@enonic/lib-admin-ui/Exception';
import {UserFilteredDataScrollEvent} from '../../event/UserFilteredDataScrollEvent';
import {UserItemsStopScrollEvent} from '../../event/UserItemsStopScrollEvent';

export class PrincipalBrowseFilterPanel
    extends BrowseFilterPanel<UserTreeGridItem> {

    static PRINCIPAL_TYPE_AGGREGATION_NAME: string = 'principalType';

    private principalTypeAggregationGroupView: AggregationGroupView;

    constructor() {
        super();

        this.fetchAndUpdateAggregations();
        this.initHitsCounter();
        this.initEventHandlers();
    }

    private initEventHandlers() {
    //
    }

    private initHitsCounter() {
        new ListUserItemsRequest().sendAndParse().then((result: ListUserItemsRequestResult) => {
            this.updateHitsCounter(result.total, true);
        }).catch((reason: Error | Exception) => {
            DefaultErrorHandler.handle(reason);
        });
    }

    protected getGroupViews(): AggregationGroupView[] {
        this.principalTypeAggregationGroupView = new AggregationGroupView(
            PrincipalBrowseFilterPanel.PRINCIPAL_TYPE_AGGREGATION_NAME,
            i18n('field.types')
        );

        return [this.principalTypeAggregationGroupView];
    }

    doRefresh(): Q.Promise<void> {
        if (!this.isFilteredOrConstrained()) {
            return this.resetFacets(true);
        }

        return this.refreshDataAndHandleResponse();
    }

    protected doSearch(): Q.Promise<void> {
        if (!this.isFilteredOrConstrained()) {
            return this.reset();
        }

        return this.searchDataAndHandleResponse();
    }

    protected resetFacets(suppressEvent?: boolean, doResetAll?: boolean): Q.Promise<void> {
        return new ListUserItemsRequest().sendAndParse().then((result: ListUserItemsRequestResult) => {
            return this.fetchAndUpdateAggregations().then(() => {
                this.updateHitsCounter(result.total, true);
                this.toggleAggregationsVisibility(result.aggregations);

                // then fire usual reset event with content grid reloading
                if (!suppressEvent) {
                    new BrowseFilterResetEvent().fire();
                }
            });
        }).catch((reason) => {
            DefaultErrorHandler.handle(reason);
        });
    }

    private getCheckedTypes(): UserItemType[] {
        const values: SearchInputValues = this.getSearchInputValues();
        const aggregationType: string = PrincipalBrowseFilterPanel.PRINCIPAL_TYPE_AGGREGATION_NAME;
        const selectedBuckets: Bucket[] = values.getSelectedValuesForAggregationName(aggregationType) || [];
        return selectedBuckets
            .map(bucket => UserItemType[bucket.getKey().replace(/\s/g, '_').toUpperCase()])
            .filter(type => type != null);
    }

    // setCount(100): Initially get only 100 users. The UserFilteredDataScrollEvent will request more if necessary.
    private searchDataAndHandleResponse(): Q.Promise<void> {
        const types: UserItemType[] = this.getCheckedTypes();
        const searchString: string = this.getSearchInputValues().getTextSearchFieldValue();
        const itemIds: string[] = this.getSelectedItemIds();

        return new ListUserItemsRequest()
            .setCount(0)
            .setTypes(types)
            .setQuery(searchString)
            .setItems(itemIds)
            .sendAndParse()
            .then((result: ListUserItemsRequestResult) => {
                this.handleDataSearchResult(result, types, searchString);
            }).catch((reason) => {
                DefaultErrorHandler.handle(reason);
            });
    }

    private refreshDataAndHandleResponse(): Q.Promise<void> {
        const types: UserItemType[] = this.getCheckedTypes();
        const searchString: string = this.getSearchInputValues().getTextSearchFieldValue();
        const itemIds: string[] = this.getSelectedItemIds();

        return new ListUserItemsRequest().setCount(0).setTypes(types).setQuery(searchString).setItems(itemIds).sendAndParse()
            .then((result: ListUserItemsRequestResult) => {
                if (result.total > 0) {
                    this.handleDataSearchResult(result, types, searchString);
                } else {
                    this.handleNoSearchResultOnRefresh();
                }
            }).catch((reason) => {
                DefaultErrorHandler.handle(reason);
            });
    }

    getSelectedItemIds(): string[] {
        if (this.hasConstraint()) {
            return this.getSelectionItems();
        }

        return [];
    }

    private handleDataSearchResult(result: ListUserItemsRequestResult, types: UserItemType[], searchString: string) {
        this.fetchAndUpdateAggregations().then(() => {
            const itemIds: string[] = this.getSelectedItemIds();

            new BrowseFilterSearchEvent(new PrincipalBrowseSearchData(searchString, types, itemIds)).fire();

            this.updateHitsCounter(result.total, StringHelper.isBlank(searchString));
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
        aggregations.forEach((aggregation: BucketAggregation) => {
            const aggregationIsEmpty = !aggregation.getBuckets().some(bucket => bucket.docCount > 0);

            const isTypeAggregation = aggregation.getName() === PrincipalBrowseFilterPanel.PRINCIPAL_TYPE_AGGREGATION_NAME;
            if (isTypeAggregation) {
                this.principalTypeAggregationGroupView.setVisible(!aggregationIsEmpty);
            }
        });
    }

    private fetchAndUpdateAggregations(): Q.Promise<void> {
        const searchString: string = this.getSearchInputValues().getTextSearchFieldValue();
        const itemIds: string[] = this.getSelectedItemIds();

        return new ListTypesRequest()
            .setQuery(searchString)
            .setItems(itemIds)
            .sendAndParse()
            .then((typeAggregation) => {
                this.updateAggregations([typeAggregation]);
                this.toggleAggregationsVisibility([typeAggregation]);
            }).catch((reason) => {
                DefaultErrorHandler.handle(reason);
            });
    }

    updateAggregations(aggregations: BucketAggregation[]): void {
        this.initPrincipalTypeBuckets(aggregations);

        super.updateAggregations(aggregations);
    }

    private getPrincipalTypeDisplayName(key: string) {
        switch (key.toLowerCase()) {
            case 'user': return i18n('field.user');
            case 'group': return i18n('field.group');
            case 'role': return i18n('field.role');
            case 'id_provider': return i18n('field.idProvider');
            default: StringHelper.capitalize(key.toLowerCase());
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
