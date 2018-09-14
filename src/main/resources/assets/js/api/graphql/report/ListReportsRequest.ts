import {ListGraphQlRequest} from '../ListGraphQlRequest';
import {Report} from '../../../app/report/Report';
import PrincipalKey = api.security.PrincipalKey;

export class ListReportsRequest
    extends ListGraphQlRequest<any, Report[]> {
    private principalKey: PrincipalKey;
    private repositoryIds: string[];

    getQuery(): string {
        return `query($principalKey: String, $repositoryIds: [String], $start: Int, $count: Int, $sort: SortMode) {
            permissionReports(principalKey: $principalKey, repositoryIds: $repositoryIds, start: $start, count: $count, sort: $sort) {
                id,
                url,
                taskId,
                principalKey,
                finished,
                principalDisplayName,
                repositoryId,
                reportBranch
            }
        }`;
    }

    setPrincipalKey(key: PrincipalKey): ListReportsRequest {
        this.principalKey = key;
        return this;
    }

    setRepositoryIds(repositoryIds: string[]): ListReportsRequest {
        this.repositoryIds = repositoryIds;
        return this;
    }

    getVariables(): { [p: string]: any } {
        const vars = super.getVariables();
        if (!!this.principalKey) {
            vars['principalKey'] = this.principalKey.toString();
        }
        if (!!this.repositoryIds) {
            vars['repositoryIds'] = this.repositoryIds;
        }
        return vars;
    }

    sendAndParse(): wemQ.Promise<Report[]> {
        return this.query().then(response => response.permissionReports.map(Report.fromJson));
    }
}
