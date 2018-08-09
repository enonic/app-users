import {GraphQlRequest} from '../GraphQlRequest';
import PrincipalKey = api.security.PrincipalKey;

export class GeneratePermissionsReport
    extends GraphQlRequest<any, string[]> {

    private principalKey: PrincipalKey;
    private repositoryKeys: String[] = [];

    setPrincipalKey(value: PrincipalKey): GeneratePermissionsReport {
        this.principalKey = value;
        return this;
    }

    setRepositoryKeys(value: String[]): GeneratePermissionsReport {
        this.repositoryKeys = value;
        return this;
    }

    getQuery(): string {
        return `mutation ($principalKey: String!, $repositoryKeys: [String]!) {
            generatePermissionReports(principalKey: $principalKey, repositoryKeys: $repositoryKeys) {
                ids
            }
        }`;
    }

    getVariables(): { [p: string]: any } {
        const vars = super.getVariables();
        vars['principalKey'] = this.principalKey.toString();
        vars['repositoryKeys'] = this.repositoryKeys;
        return vars;
    }

    sendAndParse(): wemQ.Promise<string[]> {
        return this.query().then(response => response.generatePermissionReports.ids);
    }
}
