import {Principal} from 'lib-admin-ui/security/Principal';
import {PrincipalJson} from 'lib-admin-ui/security/PrincipalJson';
import {PrincipalKey} from 'lib-admin-ui/security/PrincipalKey';
import {BucketAggregation} from 'lib-admin-ui/aggregation/BucketAggregation';
import {UserItem} from 'lib-admin-ui/security/UserItem';
import {User} from '../../app/principal/User';
import {Group} from '../../app/principal/Group';
import {Role} from '../../app/principal/Role';
import {UserJson} from '../../app/principal/UserJson';
import {GroupJson} from '../../app/principal/GroupJson';
import {RoleJson} from '../../app/principal/RoleJson';
import {ListGraphQlRequest} from '../ListGraphQlRequest';
import {UserItemBucketAggregationJson} from '../aggregation/UserItemBucketAggregationJson';
import {UserItemAggregationHelper} from '../aggregation/UserItemAggregationHelper';
import {UserItemType} from '../../app/browse/UserItemType';
import {IdProvider} from '../../app/principal/IdProvider';
import {IdProviderJson} from '../../app/principal/IdProviderJson';

export type ListUserItemsRequestResult = {
    total: number,
    userItems: UserItem[],
    aggregations: BucketAggregation[]
};

export class ListUserItemsRequest
    extends ListGraphQlRequest<any> {

    private types: UserItemType[];
    private searchQuery: string;
    private itemIds: string[];

    setTypes(types: UserItemType[]): ListUserItemsRequest {
        this.types = types;
        return this;
    }

    setQuery(query: string): ListUserItemsRequest {
        this.searchQuery = query;
        return this;
    }

    setItems(items: string[]): ListUserItemsRequest {
        this.itemIds = items;
        return this;
    }

    getVariables(): {[key: string]: any} {
        const vars = super.getVariables();

        if (this.types && this.types.length > 0) {
            vars['types'] = this.types.map(type => UserItemType[type]);
        }

        if (this.searchQuery) {
            vars['query'] = this.searchQuery;
        }

        if (this.itemIds && this.itemIds.length > 0) {
            vars['itemIds'] = this.itemIds;
        }

        return vars;
    }

    getQuery(): string {
        return `query($types: [UserItemType], $query: String, $itemIds: [String], $start: Int, $count: Int) {
                    userItemsConnection (types: $types, query: $query, itemIds: $itemIds, start: $start, count: $count) {
                        totalCount
                        edges {
                            node {
                                key,
                                name,
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

    sendAndParse(): Q.Promise<ListUserItemsRequestResult> {
        return this.query().then((response: any) => {
            const data = response.userItemsConnection;
            const result: ListUserItemsRequestResult = {
                total: data.totalCount,
                userItems: data.edges.map(edge => this.fromJsonToUserItem(edge.node)),
                aggregations: this.fromJsonToAggregations(data.aggregations),
            };

            return result;
        });
    }

    private fromJsonToAggregations(jsons: UserItemBucketAggregationJson[]): BucketAggregation[] {
        if (!jsons || jsons.length < 1) {
            return null;
        }
        const aggregations = jsons.map(json => UserItemAggregationHelper.fromJson(json));

        const typeAggregation = aggregations.filter(agg => agg.getName() === 'principalType')[0];
        UserItemAggregationHelper.updatePrincipalTypeAggregation(typeAggregation);

        return aggregations;
    }

    private fromJsonToUserItem(json: PrincipalJson | IdProviderJson): Principal | IdProvider {
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
            return IdProvider.fromJson(<IdProviderJson>json);
        }
    }
}
