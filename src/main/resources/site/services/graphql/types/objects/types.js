var graphQl = require('/lib/graphql');

var graphQlAggregations = require('./aggregations');

exports.TypesType = graphQl.createObjectType({
    name: 'Types',
    fields: {
        totalCount: {
            type: graphQl.nonNull(graphQl.GraphQLInt),
            resolve: function(env) {
                return env.source.total;
            }
        },
        aggregations: {
            type: graphQl.list(graphQlAggregations.AggregationType),
            resolve: function(env) {
                var aggregations = env.source.aggregations;
                var aggs = [];
                Object.keys(aggregations).forEach(function(key) {
                    aggs.push({
                        name: key,
                        aggregation: aggregations[key].buckets
                    });
                });
                return aggs;
            }
        }
    }
});
