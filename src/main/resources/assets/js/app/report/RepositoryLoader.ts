import {Repository} from './Repository';
import {ListRepositoriesRequest} from '../../api/graphql/repository/ListRepositoriesRequest';

export class RepositoryLoader
    extends api.util.loader.BaseLoader<any, Repository> {

    private preservedSearchString: string;
    protected request: ListRepositoriesRequest;

    protected createRequest(): ListRepositoriesRequest {
        return new ListRepositoriesRequest();
    }

    protected getRequest(): ListRepositoriesRequest {
        return this.request;
    }

    search(searchString: string): wemQ.Promise<Repository[]> {

        this.getRequest().setSearchQuery(searchString);

        return this.load();
    }

    setSearchString(value: string) {
        super.setSearchString(value);
        this.getRequest().setSearchQuery(value);
    }

    load(): wemQ.Promise<Repository[]> {

        this.notifyLoadingData();

        return this.sendRequest()
            .then((reports: Repository[]) => {

                this.notifyLoadedData(reports);
                if (this.preservedSearchString) {
                    this.search(this.preservedSearchString);
                    this.preservedSearchString = null;
                }
                return reports;
            });
    }

}

