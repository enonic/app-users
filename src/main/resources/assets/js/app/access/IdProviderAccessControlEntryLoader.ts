import * as Q from 'q';
import {Principal} from 'lib-admin-ui/security/Principal';
import {PrincipalListJson} from 'lib-admin-ui/security/PrincipalListJson';
import {PrincipalJson} from 'lib-admin-ui/security/PrincipalJson';
import {SecurityResourceRequest} from 'lib-admin-ui/security/SecurityResourceRequest';
import {IdProviderAccessControlEntry} from './IdProviderAccessControlEntry';
import {Path} from 'lib-admin-ui/rest/Path';
import {JsonResponse} from 'lib-admin-ui/rest/JsonResponse';
import {BaseLoader} from 'lib-admin-ui/util/loader/BaseLoader';

// TODO: Implement GraphQL request and replace this one
export class FindIdProviderAccessControlEntriesRequest
    extends SecurityResourceRequest<PrincipalListJson, IdProviderAccessControlEntry[]> {

    private searchQuery: string;

    getParams(): Object {
        return {
            query: this.searchQuery
        };
    }

    getRequestPath(): Path {
        return Path.fromParent(super.getResourcePath(), 'principals');
    }

    sendAndParse(): Q.Promise<IdProviderAccessControlEntry[]> {
        return this.send().then((response: JsonResponse<PrincipalListJson>) => {
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
    extends BaseLoader<PrincipalListJson, IdProviderAccessControlEntry> {

    protected request: FindIdProviderAccessControlEntriesRequest;

    search(searchString: string): Q.Promise<IdProviderAccessControlEntry[]> {
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
