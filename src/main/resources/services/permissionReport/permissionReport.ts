var permissionReports = require('/lib/permissionReports');

export function get(req) {
    var principalKey = req.params.principalKey;
    var repositoryId = req.params.repositoryId;
    var branch = req.params.branch;

    var report = permissionReports.generateReport(principalKey, repositoryId, branch);

    return {
        contentType: 'text/csv',
        status: report ? 200 : 404,
        body: report ? report : 'Not found'
    };
};
