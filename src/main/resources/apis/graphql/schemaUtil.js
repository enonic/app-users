var graphqlLib = require('/lib/graphql');

// singleton
var schemaGenerator = graphqlLib.newSchemaGenerator();

exports.schemaGenerator = schemaGenerator;
