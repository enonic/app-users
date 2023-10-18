//TODO Remove GraphQLSchemaSynchronizer for Enonic XP 6.13

// @ts-expect-error Cannot find module '/lib/graphql' or its corresponding type declarations.ts(2307)
import {execute} from '/lib/graphql';
import {schemaGenerator} from './schemaUtil';
import * as graphQlSchema from './schema';

let schema;
Java.type('com.enonic.xp.app.users.GraphQLSchemaSynchronizer').sync(__.toScriptValue(function () {
    schema = schemaGenerator.createSchema(graphQlSchema);
}));

export function post(req) {
    let body = JSON.parse(req.body);
    let operation = body.query || body.mutation;
    if (!operation) {
        throw new Error('`query` or `mutation` param is missing.');
    }
    let result = execute(schema, operation, body.variables);
    return {
        contentType: 'application/json',
        body: result
    };
}
