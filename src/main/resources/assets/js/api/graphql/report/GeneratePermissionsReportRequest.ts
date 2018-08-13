import {GraphQlRequest} from '../GraphQlRequest';
import {Report} from '../../../app/report/Report';
import PrincipalKey = api.security.PrincipalKey;

export class GeneratePermissionsReportRequest
    extends GraphQlRequest<any, Report[]> {

    private principalKey: PrincipalKey;
    private repositoryKeys: String[] = [];

    setPrincipalKey(value: PrincipalKey): GeneratePermissionsReportRequest {
        this.principalKey = value;
        return this;
    }

    setRepositoryKeys(value: String[]): GeneratePermissionsReportRequest {
        this.repositoryKeys = value;
        return this;
    }

    getQuery(): string {
        return `mutation ($principalKey: String!, $repositoryKeys: [String]!) {
            generatePermissionReports(principalKey: $principalKey, repositoryKeys: $repositoryKeys) {
                id,
                taskId,
                principalKey,
                userStoreKey
            }
        }`;
    }

    getVariables(): { [p: string]: any } {
        const vars = super.getVariables();
        vars['principalKey'] = this.principalKey.toString();
        vars['repositoryKeys'] = this.repositoryKeys;
        return vars;
    }

    sendAndParse(): wemQ.Promise<Report[]> {
        return this.query().then(response => response.generatePermissionReports.map(Report.fromJson));
    }
}
