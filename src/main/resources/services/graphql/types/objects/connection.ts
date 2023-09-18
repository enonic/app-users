import {
    GraphQLBoolean,
    GraphQLInt,
    list,
    nonNull
    // @ts-expect-error Cannot find module '/lib/graphql' or its corresponding type declarations.ts(2307)
} from '/lib/graphql';
import { toInt } from '../../utils';
import { createAggregationsField } from './aggregations';
import { schemaGenerator } from '../../schemaUtil';


var pageInfoType = schemaGenerator.createObjectType({
    name: 'PageInfo',
    fields: {
        startCursor: {
            type: nonNull(GraphQLInt),
            resolve: function(env) {
                return toInt(env.source.startCursor);
            }
        },
        endCursor: {
            type: nonNull(GraphQLInt),
            resolve: function(env) {
                return toInt(env.source.endCursor);
            }
        },
        hasNext: {
            type: nonNull(GraphQLBoolean)
        }
    }
});

function createEdgeType(name, type) {
    return schemaGenerator.createObjectType({
        name: name + 'Edge',
        fields: {
            node: {
                type: nonNull(type)
            },
            cursor: {
                type: nonNull(GraphQLInt),
                resolve: function(env) {
                    return toInt(env.source.cursor);
                }
            }
        }
    });
}

export function createConnectionType(name, type) {
    return schemaGenerator.createObjectType({
        name: name + 'Connection',
        fields: {
            totalCount: {
                type: nonNull(GraphQLInt),
                resolve: function(env) {
                    return env.source.total;
                }
            },
            edges: {
                type: list(createEdgeType(name, type)),
                resolve: function(env) {
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
            aggregations: createAggregationsField(),
            pageInfo: {
                type: pageInfoType,
                resolve: function(env) {
                    return {
                        startCursor: env.source.start,
                        endCursor:
                            env.source.start +
                            (env.source.count === 0 ? 0 : env.source.count - 1),
                        hasNext:
                            env.source.start + env.source.count <
                            env.source.total
                    };
                }
            }
        }
    });
}
