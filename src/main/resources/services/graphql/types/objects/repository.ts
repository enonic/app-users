import {
    GraphQLString,
    list
    // @ts-expect-error Cannot find module '/lib/graphql' or its corresponding type declarations.ts(2307)
} from '/lib/graphql';
import { toArray } from '../../utils';
import { schemaGenerator } from '../../schemaUtil';


export const RepositoryType = schemaGenerator.createObjectType({
    name: 'Repository',
    description: 'Domain representation of a repository',
    fields: {
        id: {
            type: GraphQLString,
            resolve: function (env) {
                return env.source._id;
            }
        },
        name: {
            type: GraphQLString,
            resolve: function (env) {
                return env.source._name;
            }
        },
        branches: {
            type: list(GraphQLString),
            resolve: function (env) {
                return toArray(env.source.branches);
            }
        }
    }
});
