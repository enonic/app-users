import {
    GraphQLInt,
    GraphQLString,
    list
    // @ts-expect-error Cannot find module '/lib/graphql' or its corresponding type declarations.ts(2307)
} from '/lib/graphql';
import { schemaGenerator } from '../../schemaUtil';


var BucketType = schemaGenerator.createObjectType({
    name: 'Bucket',
    description: 'Aggregated result for specific key',
    fields: {
        key: {
            type: GraphQLString
        },
        docCount: {
            type: GraphQLInt
        }
    }
});

export const AggregationType = schemaGenerator.createObjectType({
    name: 'Aggregation',
    description: 'List of buckets',
    fields: {
        name: {
            type: GraphQLString
        },
        buckets: {
            type: list(BucketType),
            resolve: function(env) {
                return env.source.aggregation;
            }
        }
    }
});

export function createAggregationsField() {
    return {
        type: list(AggregationType),
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
}
