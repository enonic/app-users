import { type GraphQLType } from '/lib/graphql';

import { groupMutationFields } from '../principal/group.fields';
import { idProviderMutationFields } from '../principal/id-provider.fields';
import { principalMutationFields } from '../principal/principal.fields';
import { roleMutationFields } from '../principal/role.fields';
import { userMutationFields } from '../principal/user.fields';
import { generator } from './generator';

/**
 * ! Every root field here is nullable, by the rule `QueryType` spells out — do not "tidy" these to
 * ! `nonNull(…)`.
 */
export const MutationType: GraphQLType = generator.createObjectType({
  name: 'Mutation',
  description:
    "Write access to what this application's sections manage. A field is null only when the write could not be attempted; the accompanying error says why.",
  fields: {
    ...principalMutationFields,
    ...groupMutationFields,
    ...idProviderMutationFields,
    ...roleMutationFields,
    ...userMutationFields,
  },
});
