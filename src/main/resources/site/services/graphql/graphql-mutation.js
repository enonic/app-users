var graphQl = require('/lib/graphql');
var userstores = require('userstores');
var principals = require('principals');
var users = require('users');
var groups = require('groups');
var roles = require('roles');
var types = require('./graphql-types');
var inputs = require('./graphql-inputs');

exports.mutation = graphQl.createObjectType({
    name: 'Mutation',
    fields: {
        // User
        createUser: {
            type: types.PrincipalType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString),
                displayName: graphQl.nonNull(graphQl.GraphQLString),
                email: graphQl.nonNull(graphQl.GraphQLString),
                login: graphQl.nonNull(graphQl.GraphQLString),
                password: graphQl.nonNull(graphQl.GraphQLString),
                memberships: graphQl.list(graphQl.GraphQLString)
            },
            resolve: function (env) {

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
            type: types.PrincipalType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString),
                displayName: graphQl.nonNull(graphQl.GraphQLString),
                email: graphQl.nonNull(graphQl.GraphQLString),
                login: graphQl.nonNull(graphQl.GraphQLString),
                addMemberships: graphQl.list(graphQl.GraphQLString),
                removeMemberships: graphQl.list(graphQl.GraphQLString)
            },
            resolve: function (env) {

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
            resolve: function (env) {
                return users.updatePwd(env.args.key, env.args.password);
            }
        },

        // Group
        createGroup: {
            type: types.PrincipalType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString),
                displayName: graphQl.nonNull(graphQl.GraphQLString),
                description: graphQl.GraphQLString,
                members: graphQl.list(graphQl.GraphQLString)
            },
            resolve: function (env) {

                return groups.create({
                    key: env.args.key,
                    displayName: env.args.displayName,
                    description: env.args.description
                });
            }
        },
        updateGroup: {
            type: types.PrincipalType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString),
                displayName: graphQl.nonNull(graphQl.GraphQLString),
                description: graphQl.GraphQLString,
                addMembers: graphQl.list(graphQl.GraphQLString),
                removeMembers: graphQl.list(graphQl.GraphQLString)
            },
            resolve: function (env) {

                return groups.update({
                    key: env.args.key,
                    displayName: env.args.displayName,
                    description: env.args.description,
                    addMembers: env.args.addMembers,
                    removeMembers: env.args.removeMembers
                });
            }
        },

        // Role
        createRole: {
            type: types.PrincipalType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString),
                displayName: graphQl.nonNull(graphQl.GraphQLString),
                description: graphQl.GraphQLString,
                members: graphQl.list(graphQl.GraphQLString)
            },
            resolve: function (env) {

                return roles.create({
                    key: env.args.key,
                    displayName: env.args.displayName,
                    description: env.args.description,
                    members: env.args.members
                });
            }
        },
        updateRole: {
            type: types.PrincipalType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString),
                displayName: graphQl.nonNull(graphQl.GraphQLString),
                description: graphQl.GraphQLString,
                addMembers: graphQl.list(graphQl.GraphQLString),
                removeMembers: graphQl.list(graphQl.GraphQLString)
            },
            resolve: function (env) {

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
            type: types.UserStoreType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString),
                displayName: graphQl.nonNull(graphQl.GraphQLString),
                description: graphQl.GraphQLString,
                authConfig: inputs.AuthConfigInput,
                permissions: graphQl.list(inputs.UserStoreAccessControlInput)
            },
            resolve: function (env) {

                var authConfig = env.args.authConfig;
                if (authConfig) {
                    // parse config as there's no graphql type for it
                    authConfig.config = JSON.parse(authConfig.config)
                }

                var createdUserStore = userstores.create({
                    key: env.args.key,
                    displayName: env.args.displayName,
                    description: env.args.description,
                    authConfig: authConfig,
                    permissions: env.args.permissions
                });

                log.info('Created userStore [' + createdUserStore.key + ']');
                return createdUserStore;
            }
        }
    }
});