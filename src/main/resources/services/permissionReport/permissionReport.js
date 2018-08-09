exports.get = function (req) {
    var id = req.params.id;
    var report = 'test;report;for;' + id + ';';
    return {
        contentType: 'text/csv',
        body: report
    };
};


