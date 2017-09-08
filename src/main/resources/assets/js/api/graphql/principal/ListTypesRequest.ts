import UserStoreListResult = api.security.UserStoreListResult;
import UserStore = api.security.UserStore;
import UserStoreJson = api.security.UserStoreJson;
import {ListGraphQlRequest} from '../ListGraphQlRequest';
import {UserItemAggregationHelper} from '../aggregation/UserItemAggregationHelper';
import {UserItemBucketAggregationJson} from '../aggregation/UserItemBucketAggregationJson';
import Principal = api.security.Principal;
import PrincipalJson = api.security.PrincipalJson;
import PrincipalListJson = api.security.PrincipalListJson;
import PrincipalType = api.security.PrincipalType;
import UserStoreKey = api.security.UserStoreKey;
import PrincipalKey = api.security.PrincipalKey;
import Role = api.security.Role;
import Group = api.security.Group;
import User = api.security.User;
import StringHelper = api.util.StringHelper;
import AggregationTypeWrapperJson = api.aggregation.AggregationTypeWrapperJson;
import BucketAggregation = api.aggregation.BucketAggregation;
import Aggregation = api.aggregation.Aggregation;
import Bucket = api.aggregation.Bucket;
import BucketAggregationJson = api.aggregation.BucketAggregationJson;

export class ListTypesRequest
    extends ListGraphQlRequest<any, any> {

    private searchQuery: string;

    setQuery(query: string): ListTypesRequest {
        this.searchQuery = query;
        return this;
    }

    getQuery(): string {
        return `query {
                    types {
                        totalCount
                        aggregations {
                            name,
                            buckets {
                                key,
                                docCount
                            }
                        }
                    }
                }`;
    }

    sendAndParse(): wemQ.Promise<BucketAggregation> {
        return this.query().then((response: any) => {
            const data = response.types;
            return this.froJsonToAggregation(data.aggregations, data.totalCount);
        });
    }

    private froJsonToAggregation(jsons: UserItemBucketAggregationJson[], total: number): BucketAggregation {
        if (!jsons || jsons.length < 1) {
            return null;
        }

        const typeJson = jsons.filter(json => json.name === 'principalType')[0];

        const typeAggregation = typeJson ? UserItemAggregationHelper.fromJson(typeJson) : new BucketAggregation('principalType');
        UserItemAggregationHelper.updatePrincipalTypeAggregation(typeAggregation, total);

        return typeAggregation;
    }
}
