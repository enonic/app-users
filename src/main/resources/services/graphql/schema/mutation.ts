var graphQl = require('/lib/graphql');

var idproviders = require('/lib/idproviders');
var principals = require('/lib/principals');
var users = require('/lib/users');
var groups = require('/lib/groups');
var roles = require('/lib/roles');

var schemaGenerator = require('../schemaUtil').schemaGenerator;

var graphQlObjectTypes = require('../types').objects;
var graphQlInputTypes = require('../types').inputs;

module.exports = schemaGenerator.createObjectType({
    name: 'Mutation',
    fields: {
        // Principal
        deletePrincipals: {
            type: graphQl.list(graphQlObjectTypes.PrincipalDeleteType),
            args: {
                keys: graphQl.list(graphQl.GraphQLString)
            },
            resolve: function(env) {
                return principals.delete(env.args.keys);
            }
        },

        // User
        createUser: {
            type: graphQlObjectTypes.PrincipalType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString),
                displayName: graphQl.nonNull(graphQl.GraphQLString),
                email: graphQl.nonNull(graphQl.GraphQLString),
                login: graphQl.nonNull(graphQl.GraphQLString),
                password: graphQl.nonNull(graphQl.GraphQLString),
                memberships: graphQl.list(graphQl.GraphQLString)
            },
            resolve: function(env) {
                return users.create({
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
            type: graphQlObjectTypes.PrincipalType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString),
                displayName: graphQl.nonNull(graphQl.GraphQLString),
                email: graphQl.nonNull(graphQl.GraphQLString),
                login: graphQl.nonNull(graphQl.GraphQLString),
                addMemberships: graphQl.list(graphQl.GraphQLString),
                removeMemberships: graphQl.list(graphQl.GraphQLString)
            },
            resolve: function(env) {
                return users.update({
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
            type: graphQl.GraphQLBoolean,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString),
                password: graphQl.nonNull(graphQl.GraphQLString)
            },
            resolve: function(env) {
                return users.updatePwd(env.args.key, env.args.password);
            }
        },
        removePublicKey: {
            type: graphQl.GraphQLBoolean,
            args: {
                userKey: graphQl.nonNull(graphQl.GraphQLString),
                kid: graphQl.nonNull(graphQl.GraphQLString),
            },
            resolve: function (env) {
                return users.removePublicKey({
                    userKey: env.args.userKey,
                    kid: env.args.kid,
                });
            }
        },
        addPublicKey: {
            type: graphQlObjectTypes.PublicKeyType,
            args: {
                userKey: graphQl.nonNull(graphQl.GraphQLString),
                publicKey: graphQl.nonNull(graphQl.GraphQLString),
                label: graphQl.nonNull(graphQl.GraphQLString),
            },
            resolve: function (env) {
                return users.addPublicKey({
                    userKey: env.args.userKey,
                    publicKey: env.args.publicKey,
                    label: env.args.label,
                });
            }
        },

        // Group
        createGroup: {
            type: graphQlObjectTypes.PrincipalType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString),
                displayName: graphQl.nonNull(graphQl.GraphQLString),
                description: graphQl.GraphQLString,
                members: graphQl.list(graphQl.GraphQLString),
                memberships: graphQl.list(graphQl.GraphQLString)
            },
            resolve: function(env) {
                return groups.create({
                    key: env.args.key,
                    displayName: env.args.displayName,
                    description: env.args.description,
                    members: env.args.members,
                    memberships: env.args.memberships
                });
            }
        },
        updateGroup: {
            type: graphQlObjectTypes.PrincipalType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString),
                displayName: graphQl.nonNull(graphQl.GraphQLString),
                description: graphQl.GraphQLString,
                addMembers: graphQl.list(graphQl.GraphQLString),
                removeMembers: graphQl.list(graphQl.GraphQLString),
                addMemberships: graphQl.list(graphQl.GraphQLString),
                removeMemberships: graphQl.list(graphQl.GraphQLString)
            },
            resolve: function(env) {
                return groups.update({
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
            type: graphQlObjectTypes.PrincipalType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString),
                displayName: graphQl.nonNull(graphQl.GraphQLString),
                description: graphQl.GraphQLString,
                members: graphQl.list(graphQl.GraphQLString)
            },
            resolve: function(env) {
                return roles.create({
                    key: env.args.key,
                    displayName: env.args.displayName,
                    description: env.args.description,
                    members: env.args.members
                });
            }
        },
        updateRole: {
            type: graphQlObjectTypes.PrincipalType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString),
                displayName: graphQl.nonNull(graphQl.GraphQLString),
                description: graphQl.GraphQLString,
                addMembers: graphQl.list(graphQl.GraphQLString),
                removeMembers: graphQl.list(graphQl.GraphQLString)
            },
            resolve: function(env) {
                return roles.update({
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
            type: graphQlObjectTypes.IdProviderType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString),
                displayName: graphQl.nonNull(graphQl.GraphQLString),
                description: graphQl.GraphQLString,
                idProviderConfig: graphQlInputTypes.IdProviderConfigInput,
                permissions: graphQl.list(
                    graphQlInputTypes.IdProviderAccessControlInput
                )
            },
            resolve: function(env) {
                var idProviderConfig = env.args.idProviderConfig;
                if (idProviderConfig) {
                    // parse config as there's no graphql type for it
                    idProviderConfig.config = JSON.parse(idProviderConfig.config);
                }

                return idproviders.create({
                    key: env.args.key,
                    displayName: env.args.displayName,
                    description: env.args.description,
                    idProviderConfig: idProviderConfig,
                    permissions: env.args.permissions
                });
            }
        },
        updateIdProvider: {
            type: graphQlObjectTypes.IdProviderType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString),
                displayName: graphQl.nonNull(graphQl.GraphQLString),
                description: graphQl.GraphQLString,
                idProviderConfig: graphQlInputTypes.IdProviderConfigInput,
                permissions: graphQl.list(
                    graphQlInputTypes.IdProviderAccessControlInput
                )
            },
            resolve: function(env) {
                var idProviderConfig = env.args.idProviderConfig;
                if (idProviderConfig) {
                    // parse config as there's no graphql type for it
                    idProviderConfig.config = JSON.parse(idProviderConfig.config);
                }

                return idproviders.update({
                    key: env.args.key,
                    displayName: env.args.displayName,
                    description: env.args.description,
                    idProviderConfig: idProviderConfig,
                    permissions: env.args.permissions
                });
            }
        },
        deleteIdProviders: {
            type: graphQl.list(graphQlObjectTypes.IdProviderDeleteType),
            args: {
                keys: graphQl.list(graphQl.GraphQLString)
            },
            resolve: function(env) {
                return idproviders.delete(env.args.keys);
            }
        }
    }
});
