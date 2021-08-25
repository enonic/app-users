import {UriHelper} from 'lib-admin-ui/util/UriHelper';

export class UrlHelper {

    static getRestUri(path: string): string {
        return UriHelper.getAdminUri(UriHelper.joinPath('rest-v2', 'users', UriHelper.relativePath(path)));
    }

}
