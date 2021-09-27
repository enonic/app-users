import {ListGraphQlProperties, ListGraphQlRequest} from '../ListGraphQlRequest';
import {Repository} from '../../app/report/Repository';
import {StringHelper} from 'lib-admin-ui/util/StringHelper';

interface ListRepositoriesProperties extends ListGraphQlProperties {
    query: string;
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
        const vars = <ListRepositoriesProperties>super.getVariables();
        if (!StringHelper.isEmpty(this.searchQuery)) {
            vars['query'] = this.searchQuery;
        }
        return vars;
    }

    sendAndParse(): Q.Promise<Repository[]> {
        return this.query().then(response => response.repositories.map(Repository.fromJson));
    }
}
