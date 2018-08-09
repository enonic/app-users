var graphQl = require('/lib/graphql');

var userstores = require('/lib/userstores');
var principals = require('/lib/principals');
var users = require('/lib/users');
var groups = require('/lib/groups');
var roles = require('/lib/roles');
var permissionReports = require('/lib/permissionReports');

var graphQlObjectTypes = require('../types').objects;
var graphQlInputTypes = require('../types').inputs;

module.exports = graphQl.createObjectType({
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

        // UserStore
        createUserStore: {
            type: graphQlObjectTypes.UserStoreType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString),
                displayName: graphQl.nonNull(graphQl.GraphQLString),
                description: graphQl.GraphQLString,
                authConfig: graphQlInputTypes.AuthConfigInput,
                permissions: graphQl.list(
                    graphQlInputTypes.UserStoreAccessControlInput
                )
            },
            resolve: function(env) {
                var authConfig = env.args.authConfig;
                if (authConfig) {
                    // parse config as there's no graphql type for it
                    authConfig.config = JSON.parse(authConfig.config);
                }

                return userstores.create({
                    key: env.args.key,
                    displayName: env.args.displayName,
                    description: env.args.description,
                    authConfig: authConfig,
                    permissions: env.args.permissions
                });
            }
        },
        updateUserStore: {
            type: graphQlObjectTypes.UserStoreType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString),
                displayName: graphQl.nonNull(graphQl.GraphQLString),
                description: graphQl.GraphQLString,
                authConfig: graphQlInputTypes.AuthConfigInput,
                permissions: graphQl.list(
                    graphQlInputTypes.UserStoreAccessControlInput
                )
            },
            resolve: function(env) {
                var authConfig = env.args.authConfig;
                if (authConfig) {
                    // parse config as there's no graphql type for it
                    authConfig.config = JSON.parse(authConfig.config);
                }

                return userstores.update({
                    key: env.args.key,
                    displayName: env.args.displayName,
                    description: env.args.description,
                    authConfig: authConfig,
                    permissions: env.args.permissions
                });
            }
        },
        deleteUserStores: {
            type: graphQl.list(graphQlObjectTypes.UserStoreDeleteType),
            args: {
                keys: graphQl.list(graphQl.GraphQLString)
            },
            resolve: function(env) {
                return userstores.delete(env.args.keys);
            }
        },

        // permissionsReport
        generatePermissionReports: {
            type: graphQlObjectTypes.GeneratePermissionReportType,
            args: {
                principalKey: graphQl.nonNull(graphQl.GraphQLString),
                repositoryKeys: graphQl.list(graphQl.GraphQLString)
            },
            resolve: function (env) {
                if (!principals.isAdmin()) {
                    throw new Error('User is not logged in or has no admin rights');
                }
                var pKey = env.args.principalKey;
                var rKeys = env.args.repositoryKeys;
                return permissionReports.generate(pKey, rKeys);
            }
        },
        deletePermissionReports: {
            type: graphQl.list(graphQlObjectTypes.GeneratePermissionReportType),
            args: {
                ids: graphQl.list(graphQl.GraphQLString)
            },
            resolve: function (env) {
                if (!principals.isAdmin()) {
                    throw new Error('User is not logged in or has no admin rights');
                }
                var ids = env.args.ids;
                return permissionReports.delete(ids);
            }
        }
    }
});
