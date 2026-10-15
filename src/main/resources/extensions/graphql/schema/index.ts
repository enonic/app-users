import type { GraphQLSchema } from '/lib/graphql';

import { generator } from './generator';
import { MutationType } from './mutation';
import { QueryType } from './query';

// ? Built once when the module is first required, not per request, and answering from all four
// ? section prefixes.
export const schema: GraphQLSchema = generator.createSchema({
  query: QueryType,
  mutation: MutationType,
});
