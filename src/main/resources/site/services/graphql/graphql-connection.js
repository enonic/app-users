var graphQl = require('graphql');
var graphQlUtil = require('./graphql-util');

var pageInfoType = graphQl.createObjectType({
    name: 'PageInfo',
    fields: {
        startCursor: {
            type: graphQl.nonNull(graphQl.GraphQLInt), //TODO Replace by base64
            resolve: function (env) {
                return graphQlUtil.toInt(env.source.startCursor);
            }
        },
        endCursor: {
            type: graphQl.nonNull(graphQl.GraphQLInt), //TODO Replace by base64
            resolve: function (env) {
                return graphQlUtil.toInt(env.source.endCursor);
            }
        },
        hasNext: {
            type: graphQl.nonNull(graphQl.GraphQLBoolean),
            resolve: function (env) {
                return env.source.hasNext;
            }
        }
    }
});


function createEdgeType(name, type) {
    return graphQl.createObjectType({
        name: name + 'Edge',
        fields: {
            node: {
                type: graphQl.nonNull(type),
                resolve: function (env) {
                    return env.source.node;
                }
            },
            cursor: {
                type: graphQl.nonNull(graphQl.GraphQLInt), //TODO Replace by base64
                resolve: function (env) {
                    return graphQlUtil.toInt(env.source.cursor);
                }
            }
        }
    });
}

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

exports.createConnectionType = function (name, type) {
    return graphQl.createObjectType({
        name: name + 'Connection',
        fields: {
            totalCount: {
                type: graphQl.nonNull(graphQl.GraphQLInt),
                resolve: function (env) {
                    return env.source.total;
                }
            },
            edges: {
                type: graphQl.list(createEdgeType(name, type)),
                resolve: function (env) {
                    var hits = env.source.hits;
                    var edges = [];
                    for (var i = 0; i < hits.length; i++) {
                        edges.push({
                            node: hits[i],
                            cursor: env.source.start + i
                        });
                    }
                    return edges;
                }
            },
            aggregations: {
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
            },
            pageInfo: {
                type: pageInfoType,
                resolve: function (env) {
                    return {
                        startCursor: env.source.start,
                        endCursor: env.source.start + (env.source.count == 0 ? 0 : (env.source.count - 1)),
                        hasNext: (env.source.start + env.source.count) < env.source.total
                    }
                }
            }
        }
    });
}
