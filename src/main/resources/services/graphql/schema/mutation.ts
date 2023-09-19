import {
    GraphQLBoolean,
    GraphQLString,
    list,
    nonNull
    // @ts-expect-error Cannot find module '/lib/graphql' or its corresponding type declarations.ts(2307)
} from '/lib/graphql';

import {
    create as createIdProvider,
    delete as deleteIdProvider,
    update as updateIdProvider
} from '/lib/idproviders';
import {delete as deletePrincipals} from '/lib/principals';
import {
    addPublicKey,
    create as createUser,
    removePublicKey,
    update as updateUser,
    updatePwd
} from '/lib/users';
import {
    create as createGroup,
    update as updateGroup,
} from '/lib/groups';
import {
    create as createRole,
    update as updateRole
} from '/lib/roles';
import {ObjectTypeNames} from '../constants';
import {schemaGenerator} from '../schemaUtil';
import {
    IdProviderDeleteType,
    IdProviderType,
    PrincipalDeleteType,
    PrincipalType,
    PublicKeyType
} from '../types/objects';
import {
    IdProviderAccessControlInput,
    IdProviderConfigInput
} from '../types/inputs';


const mutation = schemaGenerator.createObjectType({
    name: ObjectTypeNames.Mutation,
    fields: {
        // Principal
        deletePrincipals: {
            type: list(PrincipalDeleteType),
            args: {
                keys: list(GraphQLString)
            },
            resolve: function (env) {
                return deletePrincipals(env.args.keys);
            }
        },

        // User
        createUser: {
            type: PrincipalType,
            args: {
                key: nonNull(GraphQLString),
                displayName: nonNull(GraphQLString),
                email: nonNull(GraphQLString),
                login: nonNull(GraphQLString),
                password: nonNull(GraphQLString),
                memberships: list(GraphQLString)
            },
            resolve: function (env) {
                return createUser({
                    key: env.args.key,
                    displayName: env.args.displayName,
                    email: env.args.email,
                    login: env.args.login,
                    password: env.args.password,
                    memberships: env.args.memberships
                });
            }
        },
        updateUser: {
            type: PrincipalType,
            args: {
                key: nonNull(GraphQLString),
                displayName: nonNull(GraphQLString),
                email: nonNull(GraphQLString),
                login: nonNull(GraphQLString),
                addMemberships: list(GraphQLString),
                removeMemberships: list(GraphQLString)
            },
            resolve: function (env) {
                return updateUser({
                    key: env.args.key,
                    displayName: env.args.displayName,
                    email: env.args.email,
                    login: env.args.login,
                    addMemberships: env.args.addMemberships,
                    removeMemberships: env.args.removeMemberships
                });
            }
        },
        updatePwd: {
            type: GraphQLBoolean,
            args: {
                key: nonNull(GraphQLString),
                password: nonNull(GraphQLString)
            },
            resolve: function (env) {
                return updatePwd(env.args.key, env.args.password);
            }
        },
        removePublicKey: {
            type: GraphQLBoolean,
            args: {
                userKey: nonNull(GraphQLString),
                kid: nonNull(GraphQLString),
            },
            resolve: function (env) {
                return removePublicKey({
                    userKey: env.args.userKey,
                    kid: env.args.kid,
                });
            }
        },
        addPublicKey: {
            type: PublicKeyType,
            args: {
                userKey: nonNull(GraphQLString),
                publicKey: nonNull(GraphQLString),
                label: nonNull(GraphQLString),
            },
            resolve: function (env) {
                return addPublicKey({
                    userKey: env.args.userKey,
                    publicKey: env.args.publicKey,
                    label: env.args.label,
                });
            }
        },

        // Group
        createGroup: {
            type: PrincipalType,
            args: {
                key: nonNull(GraphQLString),
                displayName: nonNull(GraphQLString),
                description: GraphQLString,
                members: list(GraphQLString),
                memberships: list(GraphQLString)
            },
            resolve: function (env) {
                return createGroup({
                    key: env.args.key,
                    displayName: env.args.displayName,
                    description: env.args.description,
                    members: env.args.members,
                    memberships: env.args.memberships
                });
            }
        },
        updateGroup: {
            type: PrincipalType,
            args: {
                key: nonNull(GraphQLString),
                displayName: nonNull(GraphQLString),
                description: GraphQLString,
                addMembers: list(GraphQLString),
                removeMembers: list(GraphQLString),
                addMemberships: list(GraphQLString),
                removeMemberships: list(GraphQLString)
            },
            resolve: function (env) {
                return updateGroup({
                    key: env.args.key,
                    displayName: env.args.displayName,
                    description: env.args.description,
                    addMembers: env.args.addMembers,
                    removeMembers: env.args.removeMembers,
                    addMemberships: env.args.addMemberships,
                    removeMemberships: env.args.removeMemberships
                });
            }
        },

        // Role
        createRole: {
            type: PrincipalType,
            args: {
                key: nonNull(GraphQLString),
                displayName: nonNull(GraphQLString),
                description: GraphQLString,
                members: list(GraphQLString)
            },
            resolve: function (env) {
                return createRole({
                    key: env.args.key,
                    displayName: env.args.displayName,
                    description: env.args.description,
                    members: env.args.members
                });
            }
        },
        updateRole: {
            type: PrincipalType,
            args: {
                key: nonNull(GraphQLString),
                displayName: nonNull(GraphQLString),
                description: GraphQLString,
                addMembers: list(GraphQLString),
                removeMembers: list(GraphQLString)
            },
            resolve: function (env) {
                return updateRole({
                    key: env.args.key,
                    displayName: env.args.displayName,
                    description: env.args.description,
                    addMembers: env.args.addMembers,
                    removeMembers: env.args.removeMembers
                });
            }
        },

        // IdProvider
        createIdProvider: {
            type: IdProviderType,
            args: {
                key: nonNull(GraphQLString),
                displayName: nonNull(GraphQLString),
                description: GraphQLString,
                idProviderConfig: IdProviderConfigInput,
                permissions: list(
                    IdProviderAccessControlInput
                )
            },
            resolve: function (env) {
                let idProviderConfig = env.args.idProviderConfig;
                if (idProviderConfig) {
                    // parse config as there's no graphql type for it
                    idProviderConfig.config = JSON.parse(idProviderConfig.config);
                }

                return createIdProvider({
                    key: env.args.key,
                    displayName: env.args.displayName,
                    description: env.args.description,
                    idProviderConfig: idProviderConfig,
                    permissions: env.args.permissions
                });
            }
        },
        updateIdProvider: {
            type: IdProviderType,
            args: {
                key: nonNull(GraphQLString),
                displayName: nonNull(GraphQLString),
                description: GraphQLString,
                idProviderConfig: IdProviderConfigInput,
                permissions: list(
                    IdProviderAccessControlInput
                )
            },
            resolve: function (env) {
                let idProviderConfig = env.args.idProviderConfig;
                if (idProviderConfig) {
                    // parse config as there's no graphql type for it
                    idProviderConfig.config = JSON.parse(idProviderConfig.config);
                }

                return updateIdProvider({
                    key: env.args.key,
                    displayName: env.args.displayName,
                    description: env.args.description,
                    idProviderConfig: idProviderConfig,
                    permissions: env.args.permissions
                });
            }
        },
        deleteIdProviders: {
            type: list(IdProviderDeleteType),
            args: {
                keys: list(GraphQLString)
            },
            resolve: function (env) {
                return deleteIdProvider(env.args.keys);
            }
        }
    }
});
export default mutation;
