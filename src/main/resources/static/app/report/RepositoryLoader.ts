import Q from 'q';
import {Repository} from './Repository';
import {ListRepositoriesRequest} from '../../graphql/repository/ListRepositoriesRequest';
import {BaseLoader} from '@enonic/lib-admin-ui/util/loader/BaseLoader';

export class RepositoryLoader
    extends BaseLoader<Repository> {

    private preservedSearchString: string;
    protected request: ListRepositoriesRequest;

    protected createRequest(): ListRepositoriesRequest {
        return new ListRepositoriesRequest();
    }

    protected getRequest(): ListRepositoriesRequest {
        return this.request;
    }

    search(searchString: string): Q.Promise<Repository[]> {

        this.getRequest().setSearchQuery(searchString);

        return this.load();
    }

    setSearchString(value: string): void {
        super.setSearchString(value);
        this.getRequest().setSearchQuery(value);
    }

    load(): Q.Promise<Repository[]> {

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

