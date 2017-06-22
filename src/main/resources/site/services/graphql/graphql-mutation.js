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

                var createdUser = users.create({
                    key: env.args.key,
                    displayName: env.args.displayName,
                    email: env.args.email,
                    login: env.args.login,
                    password: env.args.password
                });

                var mms = env.args.memberships;
                var updatedMms = [];
                if (createdUser && mms && mms.length > 0) {
                    updatedMms = principals.addMemberships(createdUser.key, mms);
                }

                log.info('Created user [' + createdUser.key + '] with memberships in ' + JSON.stringify(updatedMms));
                return createdUser;
            }
        },
        createGroup: {
            type: types.PrincipalType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString),
                displayName: graphQl.nonNull(graphQl.GraphQLString),
                description: graphQl.GraphQLString,
                members: graphQl.list(graphQl.GraphQLString)
            },
            resolve: function (env) {

                var createdGroup = groups.create({
                    key: env.args.key,
                    displayName: env.args.displayName,
                    description: env.args.description
                });

                var members = env.args.members;
                if (members && members.length > 0) {
                    principals.addMembers(createdGroup.key, members);
                }

                log.info('Created group [' + createdGroup.key + '] with members ' + JSON.stringify(members));

                return createdGroup;
            }
        },
        createRole: {
            type: types.PrincipalType,
            args: {
                key: graphQl.nonNull(graphQl.GraphQLString),
                displayName: graphQl.nonNull(graphQl.GraphQLString),
                description: graphQl.GraphQLString,
                members: graphQl.list(graphQl.GraphQLString)
            },
            resolve: function (env) {

                var createdRole = roles.create({
                    key: env.args.key,
                    displayName: env.args.displayName,
                    description: env.args.description
                });

                var members = env.args.members;
                if (members && members.length > 0) {
                    principals.addMembers(createdRole.key, members);
                }

                log.info('Created role [' + createdRole._id + '] with members ' + JSON.stringify(members));

                return createdRole;
            }
        },
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