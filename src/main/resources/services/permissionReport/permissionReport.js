var webSocketLib = require('/lib/xp/websocket');
var eventLib = require('/lib/xp/event');
var permissionReports = require('/lib/permissionReports');

var REPORT_GROUP = 'permissionReports';

exports.get = function (req) {
    if (req.webSocket) {
        return {
            webSocket: {
                data: {},
                subProtocols: ['permission-reports']
            }
        };
    } else {
        var id = req.params.id;
        var report = permissionReports.get(id);
        return {
            contentType: 'text/csv',
            status: report ? 200 : 404,
            body: report ? report.report : 'Not found'
        };
    }
};

exports.webSocketEvent = function (event) {
    var sessionId = event.session.id;

    switch (event.type) {
    case 'open':
        log.info('Adding client to group [' + REPORT_GROUP + ']: ' + sessionId);
        webSocketLib.addToGroup(REPORT_GROUP, sessionId);
        break;

    case 'message':
        break;

    case 'close':
        log.info('Removing client from group [' + REPORT_GROUP + ']: ' + sessionId);
        webSocketLib.removeFromGroup(REPORT_GROUP, sessionId);
        break;
    }
};

eventLib.listener({
    type: 'custom.' + permissionReports.PROGRESS_EVENT,
    localOnly: false,
    callback: function (event) {
        var reportNode = JSON.parse(event.data.report);
        var progress = event.data.progress;

        var data = JSON.stringify({report: reportNode, progress: progress});
        webSocketLib.sendToGroup(REPORT_GROUP, data);
    }
});


