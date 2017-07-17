var graphQl = require('graphql');
var graphQlUtils = require('../../utils');
var createAggregationsFiled = require('./aggregations').createAggregationsFiled;

var pageInfoType = graphQl.createObjectType({
    name: 'PageInfo',
    fields: {
        startCursor: {
            type: graphQl.nonNull(graphQl.GraphQLInt),
            resolve: function (env) {
                return graphQlUtils.toInt(env.source.startCursor);
            }
        },
        endCursor: {
            type: graphQl.nonNull(graphQl.GraphQLInt),
            resolve: function (env) {
                return graphQlUtils.toInt(env.source.endCursor);
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
                type: graphQl.nonNull(graphQl.GraphQLInt),
                resolve: function (env) {
                    return graphQlUtil.toInt(env.source.cursor);
                }
            }
        }
    });
}

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
            aggregations: createAggregationsFiled(),
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
};
