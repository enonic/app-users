import UserStoreListResult = api.security.UserStoreListResult;
import UserStore = api.security.UserStore;
import UserStoreJson = api.security.UserStoreJson;
import {ListGraphQlRequest} from '../ListGraphQlRequest';
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
import UserJson = api.security.UserJson;
import GroupJson = api.security.GroupJson;
import RoleJson = api.security.RoleJson;

type RawTypeAggregation = {
    key: string;
    count: number;
}

export type TypeAggregation = {
    type: string;
    count: number;
}

export class ListUserItemsRequest
    extends ListGraphQlRequest<any, any> {

    private searchQuery: string;

    setQuery(query: string): ListUserItemsRequest {
        this.searchQuery = query;
        return this;
    }

    getVariables(): { [key: string]: any } {
        let vars = super.getVariables();
        if (this.searchQuery) {
            vars['query'] = this.searchQuery;
        }
        return vars;
    }

    getQuery(): string {
        return `query($query: String, $start: Int, $count: Int) {
                    userItemsConnection (query: $query, start: $start, count: $count) {
                        totalCount
                        edges {
                            node {
                                key,
                                name,
                                path,
                                description,
                                displayName
                            }
                        }
                        aggregations {
                            name,
                            aggregation {
                                key,
                                count
                            }
                        }
                    }
                }`;
    }

    sendAndParse(): wemQ.Promise<any> {
        return this.query().then((response: any) => {
            const data = response.userItemsConnection;
            console.log(data);
            return {
                total: data.totalCount,
                userItems: data.edges.map(edge => this.fromJsonToUserItem(edge.node)),
                aggregations: this.fromAggregationToList(data.aggregations[0].aggregation, data.totalCount),
            }
        });
    }

    private fromAggregationToList(aggregation: RawTypeAggregation[], total: number): TypeAggregation[] {
        const principalsCount = aggregation.length > 1 ?
                                aggregation.reduce((prev: number, curr: RawTypeAggregation) => prev + curr.count, 0) :
                                (aggregation[0].count || 0);
        const userStoresCount = total - principalsCount;

        const list: TypeAggregation[] = aggregation.map(value => {
            return { type: StringHelper.capitalize(value.key), count: value.count };
        });

        if (userStoresCount !== 0) {
            list.push({ type: 'User Store', count: userStoresCount });
        }

        return list;
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
