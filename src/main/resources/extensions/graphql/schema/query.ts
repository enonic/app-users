import { type GraphQLType } from '/lib/graphql';

import { idProviderApplicationQueryFields } from '../application/id-provider-application.fields';
import { configQueryFields } from '../config/config.fields';
import { phrasesQueryFields } from '../phrases/phrases.fields';
import { groupQueryFields } from '../principal/group.fields';
import { idProviderQueryFields } from '../principal/id-provider.fields';
import { roleQueryFields } from '../principal/role.fields';
import { userQueryFields } from '../principal/user.fields';
import { repositoryQueryFields } from '../repository/repository.fields';
import { generator } from './generator';

/**
 * ! Every root field here is nullable, and that is load-bearing rather than sloppy. A screen asks for
 * ! several root fields in one document — the app gets one JS thread, so one request per screen is the
 * ! only way to make it cheap — and a field error propagates up through non-null positions, nullifying
 * ! the whole `data` entry when every position on the way is non-null. A non-null root field would
 * ! therefore take every other domain on the screen down with it. Nullable, the failure stays in its
 * ! own field and each domain gets its own verdict. Do not "tidy" these back to `nonNull(list(…))`.
 */
export const QueryType: GraphQLType = generator.createObjectType({
  name: 'Query',
  description:
    "Read access to everything this application's sections manage. A list field is null only when reading it failed; the accompanying error says why.",
  fields: {
    ...configQueryFields,
    ...phrasesQueryFields,
    ...userQueryFields,
    ...roleQueryFields,
    ...groupQueryFields,
    ...idProviderQueryFields,
    ...idProviderApplicationQueryFields,
    ...repositoryQueryFields,
  },
});
