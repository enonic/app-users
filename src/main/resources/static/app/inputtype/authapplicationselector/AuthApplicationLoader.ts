import Q from 'q';
import {BaseLoader} from '@enonic/lib-admin-ui/util/loader/BaseLoader';
import {Application} from '@enonic/lib-admin-ui/application/Application';
import {ListIdProviderApplicationsRequest} from '../../resource/ListIdProviderApplicationsRequest';


export class AuthApplicationLoader
    extends BaseLoader<Application> {

    constructor() {
        super();
    }

    protected createRequest(): ListIdProviderApplicationsRequest {
        return new ListIdProviderApplicationsRequest();
    }

    filterFn(application: Application): boolean {
        return application.getDisplayName().toString().toLowerCase().indexOf(this.getSearchString().toLowerCase()) !== -1;
    }

    search(searchString: string): Q.Promise<Application[]> {
        if (this.getResults()) {
            return super.search(searchString);
        }
        return this.load().then(() => super.search(searchString));
    }
}
