import {ListGraphQlRequest} from '../ListGraphQlRequest';

export class DeleteReportsRequest
    extends ListGraphQlRequest<any, number> {
    private readonly ids: string[];

    constructor(ids: string[]) {
        super();
        this.ids = ids;
    }

    getQuery(): string {
        return `mutation($ids: [String]!) {
            deletePermissionReports(ids: $ids)
        }`;
    }

    getVariables(): { [p: string]: any } {
        const vars = super.getVariables();
        vars['ids'] = this.ids;
        return vars;
    }

    sendAndParse(): wemQ.Promise<number> {
        return this.query().then(response => response.deletePermissionReports);
    }
}
