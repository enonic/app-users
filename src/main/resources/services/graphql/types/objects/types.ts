import {
    GraphQLInt,
    list,
    nonNull
    // @ts-expect-error Cannot find module '/lib/graphql' or its corresponding type declarations.ts(2307)
} from '/lib/graphql';
import { AggregationType } from './aggregations';
import { schemaGenerator } from '../../schemaUtil';


export = schemaGenerator.createObjectType({
    name: 'Types',
    fields: {
        totalCount: {
            type: nonNull(GraphQLInt),
            resolve: function(env) {
                return env.source.total;
            }
        },
        aggregations: {
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
        }
    }
});
