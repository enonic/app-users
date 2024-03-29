import {ListGraphQlProperties, ListGraphQlRequest} from '../ListGraphQlRequest';
import {Repository, RepositoryData} from '../../app/report/Repository';
import {StringHelper} from '@enonic/lib-admin-ui/util/StringHelper';

interface ListRepositoriesProperties extends ListGraphQlProperties {
    query: string;
}

interface ListRepositoriesResult {
    repositories: RepositoryData[];
}

export class ListRepositoriesRequest
    extends ListGraphQlRequest<Repository[]> {
    private searchQuery: string;

    getQuery(): string {
        return `query($query: String, $start: Int, $count: Int, $sort: SortMode) {
            repositories(query: $query, start: $start, count: $count, sort: $sort) {
                id,
                name,
                branches
            }
        }`;
    }

    setSearchQuery(query: string): ListRepositoriesRequest {
        this.searchQuery = query;
        return this;
    }

    getVariables(): ListRepositoriesProperties {
        const vars = super.getVariables() as ListRepositoriesProperties;
        if (!StringHelper.isEmpty(this.searchQuery)) {
            vars['query'] = this.searchQuery;
        }
        return vars;
    }

    sendAndParse(): Q.Promise<Repository[]> {
        return this.query().then((response: ListRepositoriesResult) => response.repositories.map(Repository.fromJson));
    }
}
