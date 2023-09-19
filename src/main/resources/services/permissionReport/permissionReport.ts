import {generateReport} from '/lib/users/permissionReports';

export function get(req) {
    let principalKey = req.params.principalKey;
    let repositoryId = req.params.repositoryId;
    let branch = req.params.branch;

    let report = generateReport(principalKey, repositoryId, branch);

    return {
        contentType: 'text/csv',
        status: report ? 200 : 404,
        body: report ? report : 'Not found'
    };
}
