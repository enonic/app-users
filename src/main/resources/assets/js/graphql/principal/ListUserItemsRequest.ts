import {Principal} from '@enonic/lib-admin-ui/security/Principal';
import {PrincipalJson} from '@enonic/lib-admin-ui/security/PrincipalJson';
import {PrincipalKey} from '@enonic/lib-admin-ui/security/PrincipalKey';
import {BucketAggregation} from '@enonic/lib-admin-ui/aggregation/BucketAggregation';
import {UserItem} from '@enonic/lib-admin-ui/security/UserItem';
import {User} from '../../app/principal/User';
import {Group} from '../../app/principal/Group';
import {Role} from '../../app/principal/Role';
import {UserJson} from '../../app/principal/UserJson';
import {GroupJson} from '../../app/principal/GroupJson';
import {UserItemBucketAggregationJson} from '../aggregation/UserItemBucketAggregationJson';
import {UserItemAggregationHelper} from '../aggregation/UserItemAggregationHelper';
import {UserItemType} from '../../app/browse/UserItemType';
import {IdProvider} from '../../app/principal/IdProvider';
import {IdProviderJson} from '../../app/principal/IdProviderJson';
import {ListItemsProperties, ListItemsRequest} from './ListItemsRequest';

// UserItems does not map "name" property. Missing type? or wrong graph query?
export interface ListUserItemsRequestResult {
    total: number,
    userItems: UserItem[],
    aggregations: BucketAggregation[]
}

interface ListUserItemsProperties extends ListItemsProperties {
    types: string[];
}

interface ListUserItemsGraph {
    userItemsConnection: {
        totalCount: number;
        edges: [{
            node: {
                key: string;
                name: string;
                description: string;
                displayName: string;
            }
        }],
        aggregations: UserItemBucketAggregationJson[];
    }
}

export class ListUserItemsRequest
    extends ListItemsRequest<ListUserItemsRequestResult> {

    private types: UserItemType[];

    constructor(){
        super();
    }

    setCount(value: number): ListUserItemsRequest {
        this.count = value;
        return this;
    }

    setTypes(types: UserItemType[]): ListUserItemsRequest {
        this.types = types;
        return this;
    }

    getVariables(): ListUserItemsProperties {
        const vars = super.getVariables() as ListUserItemsProperties;

        if (this.types && this.types.length > 0) {
            vars['types'] = this.types.map(type => UserItemType[type]);
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
        return this.query().then((response: ListUserItemsGraph) => {
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
                return Role.fromJson(json);
            } else if (pKey.isGroup()) {
                return Group.fromJson(json as GroupJson);
            } else /*if (pKey.isUser())*/ {
                return User.fromJson(json as UserJson);
            }
        } catch (e) {
            return IdProvider.fromJson(json as IdProviderJson);
        }
    }
}
