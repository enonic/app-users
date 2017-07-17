var graphQl = require('/lib/graphql');

var graphQlSchema = require('./schema');

var schema = graphQl.createSchema(graphQlSchema);

// Controller methods

exports.post = function (req) {
    var body = JSON.parse(req.body);
    var operation = body.query || body.mutation;
    if (!operation) {
        throw '`query` or `mutation` param is missing.';
    }
    var result = graphQl.execute(schema, operation, body.variables);
    return {
        contentType: 'application/json',
        body: result
    };
};

exports.get = function (req) {
    var operation = req.params.query || req.params.mutation;
    if (!operation) {
        throw '`query` or `mutation` param is missing.';
    }
    var vars = req.params.variables;
    if (typeof vars === 'string') {
        try {
            vars = JSON.parse(vars);
        } catch (e) { /* empty */ }
    }
    var result = graphQl.execute(schema, operation, vars);
    return {
        contentType: 'application/json',
        body: result
    };
};
