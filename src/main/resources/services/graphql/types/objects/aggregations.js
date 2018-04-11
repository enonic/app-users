var graphQl = require('/lib/graphql');

var BucketType = graphQl.createObjectType({
    name: 'Bucket',
    description: 'Aggregated result for specific key',
    fields: {
        key: {
            type: graphQl.GraphQLString
        },
        docCount: {
            type: graphQl.GraphQLInt
        }
    }
});

var AggregationType = graphQl.createObjectType({
    name: 'Aggregation',
    description: 'List of buckets',
    fields: {
        name: {
            type: graphQl.GraphQLString
        },
        buckets: {
            type: graphQl.list(BucketType),
            resolve: function(env) {
                return env.source.aggregation;
            }
        }
    }
});
exports.AggregationType = AggregationType;

exports.createAggregationsFiled = function createAggregationsFiled() {
    return {
        type: graphQl.list(AggregationType),
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
    };
};
