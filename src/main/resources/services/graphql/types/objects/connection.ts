import {
    InterfaceTypeNames,
    ObjectTypeNames
} from '../../constants';

import {
    GraphQLBoolean,
    GraphQLInt,
    list,
    nonNull
    // @ts-expect-error Cannot find module '/lib/graphql' or its corresponding type declarations.ts(2307)
} from '/lib/graphql';
import {createAggregationsField} from './aggregations';
import {schemaGenerator} from '../../schemaUtil';


const pageInfoType = schemaGenerator.createObjectType({
    name: ObjectTypeNames.PageInfo,
    fields: {
        startCursor: {
            type: nonNull(GraphQLInt),
            resolve: function (env) {
                return env.source.startCursor.intValue();
            }
        },
        endCursor: {
            type: nonNull(GraphQLInt),
            resolve: function (env) {
                return env.source.endCursor.intValue();
            }
        },
        hasNext: {
            type: nonNull(GraphQLBoolean)
        }
    }
});

function createEdgeType(name: InterfaceTypeNames|ObjectTypeNames, type) {
    return schemaGenerator.createObjectType({
        name: name + 'Edge',
        fields: {
            node: {
                type: nonNull(type)
            },
            cursor: {
                type: nonNull(GraphQLInt),
                resolve: function (env) {
                    return env.source.cursor.intValue();
                }
            }
        }
    });
}

export function createConnectionType(name: InterfaceTypeNames|ObjectTypeNames, type) {
    return schemaGenerator.createObjectType({
        name: name + 'Connection',
        fields: {
            totalCount: {
                type: nonNull(GraphQLInt),
                resolve: function (env) {
                    return env.source.total;
                }
            },
            edges: {
                type: list(createEdgeType(name, type)),
                resolve: function (env) {
                    let hits = env.source.hits;
                    let edges = [];
                    for (let i = 0; i < hits.length; i++) {
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
                resolve: function (env) {
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
