var graphQl = require('/lib/graphql');
var graphQlQuery = require('./graphql-query').query;

var schema = graphQl.createSchema({
    query: graphQlQuery
});

exports.post = function (req) {
    log.info('graphQL service [post]: ' + JSON.stringify(req.body));
    var body = JSON.parse(req.body);
    var result = graphQl.execute(schema, body.query, body.variables);
    return {
        contentType: 'application/json',
        body: result
    };
};

exports.get = function (req) {
    log.info('graphQL service [get]: ' + JSON.stringify(req.params));
    var result = graphQl.execute(schema, req.params.query, req.params.variables);
    return {
        contentType: 'application/json',
        body: result
    };
};