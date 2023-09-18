//TODO Remove GraphQLSchemaSynchronizer for Enonic XP 6.13

// @ts-expect-error Cannot find module '/lib/graphql' or its corresponding type declarations.ts(2307)
import { execute } from '/lib/graphql';
import { schemaGenerator } from './schemaUtil';

Java.type('com.enonic.xp.app.users.GraphQLSchemaSynchronizer').sync(__.toScriptValue(function() {
    var graphQlSchema = require('./schema');
    var schema = schemaGenerator.createSchema(graphQlSchema);
}));

export function post(req) {
    var body = JSON.parse(req.body);
    var operation = body.query || body.mutation;
    if (!operation) {
        throw new Error('`query` or `mutation` param is missing.');
    }
    var result = execute(schema, operation, body.variables);
    return {
        contentType: 'application/json',
        body: result
    };
};
