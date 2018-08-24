var graphQl = require('/lib/graphql');
var authLib = require('/lib/auth');

var userstores = require('/lib/userstores');
var principals = require('/lib/principals');
var users = require('/lib/users');
var groups = require('/lib/groups');
var roles = require('/lib/roles');
var permissionReports = require('/lib/permissionReports');
var auditLog = require('/lib/auditLog');
var ACTIONS = auditLog.ACTIONS;
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
                var keys = env.args.keys;
                auditLog.notify(keys, ACTIONS.DELETE);
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
                var key = env.args.key;
                auditLog.notify(key, ACTIONS.CREATE);
                return users.create({
                    key: key,
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
                var key = env.args.key;
                auditLog.notify(key, ACTIONS.UPDATE);
                return users.update({
                    key: key,
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
                auditLog.notify(key, ACTIONS.UPDATE);
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
                var key = env.args.key;
                auditLog.notify(key, ACTIONS.CREATE);
                return groups.create({
                    key: key,
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
                var key = env.args.key;
                auditLog.notify(key, ACTIONS.UPDATE);
                return groups.update({
                    key: key,
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
                var key = env.args.key;
                auditLog.notify(key, ACTIONS.CREATE);
                return roles.create({
                    key: key,
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
                var key = env.args.key;
                auditLog.notify(key, ACTIONS.UPDATE);
                return roles.update({
                    key: key,
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
                var key = env.args.key;
                auditLog.notify(key, ACTIONS.CREATE);
                return userstores.create({
                    key: key,
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

                var key = env.args.key;
                auditLog.notify(key, ACTIONS.UPDATE);
                return userstores.update({
                    key: key,
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
                var keys = env.args.keys;
                auditLog.notify(keys, ACTIONS.CREATE);
                return userstores.delete(keys);
            }
        },

        // permissionsReport
        generatePermissionReports: {
            type: graphQl.list(graphQlObjectTypes.PermissionReportType),
            args: {
                principalKey: graphQl.nonNull(graphQl.GraphQLString),
                repositoryIds: graphQl.nonNull(graphQl.list(graphQl.GraphQLString))
            },
            resolve: function (env) {
                if (!authLib.isAdmin()) {
                    throw new Error('You don\'t have permission to access this resource');
                }
                var principalKey = env.args.principalKey;
                var repositoryIds = env.args.repositoryIds;
                return permissionReports.generate(principalKey, repositoryIds);
            }
        },
        deletePermissionReports: {
            type: graphQl.GraphQLInt,
            args: {
                ids: graphQl.list(graphQl.GraphQLString)
            },
            resolve: function (env) {
                if (!authLib.isAdmin()) {
                    throw new Error('You don\'t have permission to access this resource');
                }
                var ids = env.args.ids;
                return permissionReports.delete(ids);
            }
        }
    }
});
