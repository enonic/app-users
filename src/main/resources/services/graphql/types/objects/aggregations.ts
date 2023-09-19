import {
    GraphQLInt,
    GraphQLString,
    list
    // @ts-expect-error Cannot find module '/lib/graphql' or its corresponding type declarations.ts(2307)
} from '/lib/graphql';
import {ObjectTypeNames} from '../../constants';
import {schemaGenerator} from '../../schemaUtil';


const BucketType = schemaGenerator.createObjectType({
    name: ObjectTypeNames.Bucket,
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
    name: ObjectTypeNames.Aggregation,
    description: 'List of buckets',
    fields: {
        name: {
            type: GraphQLString
        },
        buckets: {
            type: list(BucketType),
            resolve: function (env) {
                return env.source.aggregation;
            }
        }
    }
});

export function createAggregationsField() {
    return {
        type: list(AggregationType),
        resolve: function (env) {
            let aggregations = env.source.aggregations;
            let aggs = [];
            Object.keys(aggregations).forEach(function (key) {
                aggs.push({
                    name: key,
                    aggregation: aggregations[key].buckets
                });
            });
            return aggs;
        }
    };
}
