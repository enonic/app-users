import {JsonResponse} from 'lib-admin-ui/rest/JsonResponse';
import {ApplicationResourceRequest} from 'lib-admin-ui/application/ApplicationResourceRequest';
import {ApplicationListResult} from 'lib-admin-ui/application/ApplicationListResult';
import {Application} from 'lib-admin-ui/application/Application';
import {UrlHelper} from '../../util/UrlHelper';

export class ListIdProviderApplicationsRequest
    extends ApplicationResourceRequest<Application[]> {

    constructor() {
        super();
        this.addRequestPathElements('getIdProviderApplications');
    }

    getPostfixUri(): string {
        return UrlHelper.getRestUri('');
    }

    protected parseResponse(response: JsonResponse<ApplicationListResult>): Application[] {
        return Application.fromJsonArray(response.getResult().applications);
    }
}
