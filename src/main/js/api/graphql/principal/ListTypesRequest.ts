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

type RawTypeAggregation = {
    key: string;
    count: number;
}

export type TypeAggregation = {
    type: string;
    count: number;
}

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
            const data = response.types;
            return this.fromAggregationToList(data.aggregations[0].aggregation, data.totalCount);
        });
    }

    private fromAggregationToList(aggregation: RawTypeAggregation[] = [], total: number): TypeAggregation[] {
        const principalsCount = aggregation.length > 1 ?
                                aggregation.reduce((prev: number, curr: RawTypeAggregation) => prev + curr.count, 0) :
                                (aggregation[0] && aggregation[0].count || 0);
        const userStoresCount = total - principalsCount;

        const list: TypeAggregation[] = aggregation.map(value => {
            return { type: StringHelper.capitalize(value.key), count: value.count };
        });

        if (userStoresCount !== 0) {
            list.push({ type: 'User Store', count: userStoresCount });
        }

        return list;
    }
}
