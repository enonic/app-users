// @ts-expect-error Cannot find module '/lib/graphql' or its corresponding type declarations.ts(2307)
import {newSchemaGenerator} from '/lib/graphql';

// singleton
export const schemaGenerator = newSchemaGenerator();
