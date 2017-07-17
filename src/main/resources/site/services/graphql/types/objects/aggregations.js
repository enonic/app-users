var graphQl = require('/lib/graphql');

var BucketType = graphQl.createObjectType({
    name: 'Bucket',
    description: 'Aggregated result for specific key',
    fields: {
        key: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.key;
            }
        },
        count: {
            type: graphQl.GraphQLInt,
            resolve: function (env) {
                return env.source.docCount;
            }
        }
    }
});

var AggregationType = graphQl.createObjectType({
    name: 'Aggregation',
    description: 'List of buckets',
    fields: {
        name: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.name;
            }
        },
        aggregation: {
            type: graphQl.list(BucketType),
            resolve: function (env) {
                return env.source.aggregation;
            }
        }
    }
});
exports.AggregationType = AggregationType;

exports.createAggregationsFiled = function createAggregationsFiled() {
    return {
        type: graphQl.list(AggregationType),
        resolve: function (env) {
            var aggregations = env.source.aggregations;
            var aggs = [];
            for (var key in aggregations) {
                if (aggregations.hasOwnProperty(key)) {
                    aggs.push({
                        name: key,
                        aggregation: aggregations[key].buckets
                    });
                }
            }
            return aggs;
        }
    };
};
