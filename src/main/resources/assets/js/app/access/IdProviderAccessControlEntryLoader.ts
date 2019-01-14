import Principal = api.security.Principal;
import PrincipalListJson = api.security.PrincipalListJson;
import PrincipalJson = api.security.PrincipalJson;
import SecurityResourceRequest = api.security.SecurityResourceRequest;
import {IdProviderAccessControlEntry} from './IdProviderAccessControlEntry';

// TODO: Implement GraphQL request and replace this one
export class FindIdProviderAccessControlEntriesRequest
    extends SecurityResourceRequest<PrincipalListJson, IdProviderAccessControlEntry[]> {

    private searchQuery: string;

    getParams(): Object {
        return {
            query: this.searchQuery
        };
    }

    getRequestPath(): api.rest.Path {
        return api.rest.Path.fromParent(super.getResourcePath(), 'principals');
    }

    sendAndParse(): wemQ.Promise<IdProviderAccessControlEntry[]> {
        return this.send().then((response: api.rest.JsonResponse<PrincipalListJson>) => {
            return response.getResult().principals.map((principalJson: PrincipalJson) => {
                return new IdProviderAccessControlEntry(Principal.fromJson(principalJson));
            });
        });
    }

    setSearchQuery(query: string): FindIdProviderAccessControlEntriesRequest {
        this.searchQuery = query;
        return this;
    }
}

export class IdProviderAccessControlEntryLoader
    extends api.util.loader.BaseLoader<PrincipalListJson, IdProviderAccessControlEntry> {

    protected request: FindIdProviderAccessControlEntriesRequest;

    search(searchString: string): wemQ.Promise<IdProviderAccessControlEntry[]> {
        this.getRequest().setSearchQuery(searchString);
        return this.load();
    }

    protected createRequest(): FindIdProviderAccessControlEntriesRequest {
        return new FindIdProviderAccessControlEntriesRequest();
    }

    protected getRequest(): FindIdProviderAccessControlEntriesRequest {
        return this.request;
    }

    setSearchString(value: string) {
        super.setSearchString(value);
        this.getRequest().setSearchQuery(value);
    }

}
