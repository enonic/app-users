var permissionReports = require('/lib/permissionReports');

exports.get = function (req) {
    var id = req.params.id;
    var report = permissionReports.get(id);

    return {
        contentType: 'text/csv',
        status: report ? 200 : 404,
        body: report ? report.file : 'Not found'
    };
};
