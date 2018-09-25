import {GraphQlRequest} from '../GraphQlRequest';
import {Report} from '../../../app/report/Report';
import PrincipalKey = api.security.PrincipalKey;

export class GeneratePermissionsReportRequest
    extends GraphQlRequest<any, Report[]> {

    private principalKey: PrincipalKey;
    private repositoryIds: String[] = [];
    private branches: String[] = [];

    setPrincipalKey(value: PrincipalKey): GeneratePermissionsReportRequest {
        this.principalKey = value;
        return this;
    }

    setRepositoryKeys(value: String[]): GeneratePermissionsReportRequest {
        this.repositoryIds = value;
        return this;
    }

    setBranches(value: String[]): GeneratePermissionsReportRequest {
        this.branches = value;
        return this;
    }

    getQuery(): string {
        return `mutation ($principalKey: String!, $repositoryIds: [String]!, $branches: [String]!) {
            generatePermissionReports(principalKey: $principalKey, repositoryIds: $repositoryIds, branches: $branches) {
                id,
                url,
                taskId,
                principalKey,
                principalDisplayName,
                repositoryId,
                reportBranch
            }
        }`;
    }

    getVariables(): { [p: string]: any } {
        const vars = super.getVariables();
        vars['principalKey'] = this.principalKey.toString();
        vars['repositoryIds'] = this.repositoryIds;
        vars['branches'] = this.branches;
        return vars;
    }

    sendAndParse(): wemQ.Promise<Report[]> {
        return this.query().then(response => response.generatePermissionReports.map(Report.fromJson));
    }
}
