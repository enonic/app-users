import {GraphQlRequest} from '../GraphQlRequest';
import {Report} from '../../../app/report/Report';
import PrincipalKey = api.security.PrincipalKey;

export class GeneratePermissionsReportRequest
    extends GraphQlRequest<any, Report[]> {

    private principalKey: PrincipalKey;
    private repositoryIds: String[] = [];

    setPrincipalKey(value: PrincipalKey): GeneratePermissionsReportRequest {
        this.principalKey = value;
        return this;
    }

    setRepositoryKeys(value: String[]): GeneratePermissionsReportRequest {
        this.repositoryIds = value;
        return this;
    }

    getQuery(): string {
        return `mutation ($principalKey: String!, $repositoryIds: [String]!) {
            generatePermissionReports(principalKey: $principalKey, repositoryIds: $repositoryIds) {
                id,
                taskId,
                principalKey,
                repositoryId
            }
        }`;
    }

    getVariables(): { [p: string]: any } {
        const vars = super.getVariables();
        vars['principalKey'] = this.principalKey.toString();
        vars['repositoryIds'] = this.repositoryIds;
        return vars;
    }

    sendAndParse(): wemQ.Promise<Report[]> {
        return this.query().then(response => response.generatePermissionReports.map(Report.fromJson));
    }
}
