import {ListGraphQlRequest} from '../ListGraphQlRequest';
import {Report} from '../../../app/report/Report';
import PrincipalKey = api.security.PrincipalKey;
import UserStoreKey = api.security.UserStoreKey;

export class ListReportsRequest
    extends ListGraphQlRequest<any, Report[]> {
    private principalKey: PrincipalKey;
    private userStoreKeys: UserStoreKey[];

    getQuery(): string {
        return `query($principalKey: String, $userStoreKeys: [String], $start: Int, $count: Int, $sort: SortMode) {
            permissionReports(principalKey: $principalKey, userStoreKeys: $userStoreKeys, start: $start, count: $count, sort: $sort) {
                id,
                url,
                taskId,
                principalKey,
                userStoreKey
            }
        }`;
    }

    setPrincipalKey(key: PrincipalKey): ListReportsRequest {
        this.principalKey = key;
        return this;
    }

    setUserStoreKeys(keys: UserStoreKey[]): ListReportsRequest {
        this.userStoreKeys = keys;
        return this;
    }

    getVariables(): { [p: string]: any } {
        const vars = super.getVariables();
        if (!!this.principalKey) {
            vars['principalKey'] = this.principalKey.toString();
        }
        if (!!this.userStoreKeys) {
            vars['userStoreKeys'] = this.userStoreKeys.map(key => key.toString());
        }
        return vars;
    }

    sendAndParse(): wemQ.Promise<Report[]> {
        return this.query().then(response => response.permissionReports.map(Report.fromJson));
    }
}
