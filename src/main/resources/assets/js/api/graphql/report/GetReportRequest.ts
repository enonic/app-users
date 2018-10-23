import {Report} from '../../../app/report/Report';
import {GraphQlRequest} from '../GraphQlRequest';

export class GetReportRequest
    extends GraphQlRequest<any, Report> {
    private id: string;

    constructor(id: string) {
        super();
        this.id = id;
    }

    getQuery(): string {
        return `query($id: String) {
            permissionReport(id: $id) {
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

    getVariables(): { [p: string]: any } {
        const vars = super.getVariables();

        if (!!this.id) {
            vars['id'] = this.id;
        }

        return vars;
    }

    sendAndParse(): wemQ.Promise<Report> {
        return this.query().then(response => Report.fromJson(response.permissionReport));
    }
}
