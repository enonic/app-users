import UserStore = api.security.UserStore;
import UserStoreJson = api.security.UserStoreJson;
import Principal = api.security.Principal;
import PrincipalJson = api.security.PrincipalJson;
import PrincipalKey = api.security.PrincipalKey;
import Role = api.security.Role;
import Group = api.security.Group;
import User = api.security.User;
import UserJson = api.security.UserJson;
import GroupJson = api.security.GroupJson;
import RoleJson = api.security.RoleJson;
import BucketAggregation = api.aggregation.BucketAggregation;
import UserItem = api.security.UserItem;
import {ListGraphQlRequest} from '../ListGraphQlRequest';
import {UserItemBucketAggregationJson} from '../aggregation/UserItemBucketAggregationJson';
import {UserItemAggregationHelper} from '../aggregation/UserItemAggregationHelper';
import {UserItemType} from '../../../app/browse/UserItemType';

export type ListUserItemsRequestResult = {
    total: number,
    userItems: UserItem[],
    aggregations: BucketAggregation[]
};

export class ListUserItemsRequest
    extends ListGraphQlRequest<any, any> {

    private types: UserItemType[];
    private searchQuery: string;

    setTypes(types: UserItemType[]): ListUserItemsRequest {
        this.types = types;
        return this;
    }

    setQuery(query: string): ListUserItemsRequest {
        this.searchQuery = query;
        return this;
    }

    getVariables(): {[key: string]: any} {
        let vars = super.getVariables();
        if (this.types && this.types.length > 0) {
            vars['types'] = this.types.map(type => UserItemType[type]);
        }
        if (this.searchQuery) {
            vars['query'] = this.searchQuery;
        }
        return vars;
    }

    getQuery(): string {
        return `query($types: [UserItemType], $query: String, $start: Int, $count: Int) {
                    userItemsConnection (types: $types, query: $query, start: $start, count: $count) {
                        totalCount
                        edges {
                            node {
                                key,
                                description,
                                displayName
                            }
                        }
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

    sendAndParse(): wemQ.Promise<ListUserItemsRequestResult> {
        return this.query().then((response: any) => {
            const data = response.userItemsConnection;
            const result: ListUserItemsRequestResult = {
                total: data.totalCount,
                userItems: data.edges.map(edge => this.fromJsonToUserItem(edge.node)),
                aggregations: this.froJsonToAggregations(data.aggregations, data.totalCount),
            };

            return result;
        });
    }

    private froJsonToAggregations(jsons: UserItemBucketAggregationJson[], total: number): BucketAggregation[] {
        if (!jsons || jsons.length < 1) {
            return null;
        }
        const aggregations = jsons.map(json => UserItemAggregationHelper.fromJson(json));

        const typeAggregation = aggregations.filter(agg => agg.getName() === 'principalType')[0];
        UserItemAggregationHelper.updatePrincipalTypeAggregation(typeAggregation, total);

        return aggregations;
    }

    private fromJsonToUserItem(json: PrincipalJson | UserStoreJson): Principal | UserStore {
        try {
            const pKey: PrincipalKey = PrincipalKey.fromString(json.key);
            if (pKey.isRole()) {
                return Role.fromJson(<RoleJson>json);
            } else if (pKey.isGroup()) {
                return Group.fromJson(<GroupJson>json);
            } else /*if (pKey.isUser())*/ {
                return User.fromJson(<UserJson>json);
            }
        } catch (e) {
            return UserStore.fromJson(<UserStoreJson>json);
        }
    }
}
