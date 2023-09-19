import {
    GraphQLInt,
    list,
    nonNull
    // @ts-expect-error Cannot find module '/lib/graphql' or its corresponding type declarations.ts(2307)
} from '/lib/graphql';
import {AggregationType} from './aggregations';
import {ObjectTypeNames} from '../../constants';
import {schemaGenerator} from '../../schemaUtil';


export const TypesType = schemaGenerator.createObjectType({
    name: ObjectTypeNames.Types,
    fields: {
        totalCount: {
            type: nonNull(GraphQLInt),
            resolve({source}) {
                return source.total;
            }
        },
        aggregations: {
            type: list(AggregationType),
            resolve(env) {
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
        }
    }
});
