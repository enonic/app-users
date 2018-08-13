import {GraphQlRequest} from '../GraphQlRequest';
import PrincipalKey = api.security.PrincipalKey;

export class GeneratePermissionsReport
    extends GraphQlRequest<any, string[]> {

    private principalKey: PrincipalKey;
    private repositoryIds: String[] = [];

    setPrincipalKey(value: PrincipalKey): GeneratePermissionsReport {
        this.principalKey = value;
        return this;
    }

    setRepositoryKeys(value: String[]): GeneratePermissionsReport {
        this.repositoryIds = value;
        return this;
    }

    getQuery(): string {
        return `mutation ($principalKey: String!, $repositoryIds: [String]!) {
            generatePermissionReports(principalKey: $principalKey, repositoryIds: $repositoryIds) {
                ids
            }
        }`;
    }

    getVariables(): { [p: string]: any } {
        const vars = super.getVariables();
        vars['principalKey'] = this.principalKey.toString();
        vars['repositoryIds'] = this.repositoryIds;
        return vars;
    }

    sendAndParse(): wemQ.Promise<string[]> {
        return this.query().then(response => response.generatePermissionReports.ids);
    }
}
