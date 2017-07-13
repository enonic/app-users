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
            let data = response.types;
            console.log(response);
            return {
                total: data.totalCount,
                aggregations: data.aggregations
            }
        });
    }
}
