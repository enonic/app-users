import {ListGraphQlRequest} from '../ListGraphQlRequest';
import {Repository} from '../../../app/report/Repository';

export class ListRepositoriesRequest
    extends ListGraphQlRequest<any, Repository[]> {
    private searchQuery: string;

    getQuery(): string {
        return `query($start: Int, $count: Int, $sort: SortMode) {
            repositories(start: $start, count: $count, sort: $sort) {
                id,
                name
            }
        }`;
    }

    setSearchQuery(query: string): ListRepositoriesRequest {
        this.searchQuery = query;
        return this;
    }

    getVariables(): { [p: string]: any } {
        const vars = super.getVariables();
        if (!api.util.StringHelper.isEmpty(this.searchQuery)) {
            vars['search'] = this.searchQuery;
        }
        return vars;
    }

    sendAndParse(): wemQ.Promise<Repository[]> {
        return this.query().then(response => response.repositories.map(Repository.fromJson));
    }
}
