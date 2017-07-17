var graphQl = require('/lib/graphql');

var principals = require('principals');

var graphQlConnection = require('./connection');
var graphQlEnums = require('../enums');
var graphQlUtils = require('../../utils');

var UserItemType = graphQl.createInterfaceType({
    name: 'UserItem',
    description: 'User item is a base entity for every principal or user store',
    fields: {
        id: {
            type: graphQl.GraphQLID,
            resolve: function (env) {
                return env.source._id;
            }
        },
        name: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source._name;
            }
        },
        path: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source._path;
            }
        },
        displayName: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.displayName;
            }
        },
        description: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.description;
            }
        },
        modifiedTime: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source._timestamp;
            }
        }
    }
});

var AccessControlEntry = graphQl.createObjectType({
    name: 'AccessControlEntry',
    description: 'Domain representation of access control entry',
    fields: {
        principal: {
            type: graphQl.reference('Principal'),
            resolve: function (env) {
                return principals.getByKeys(env.source.principal);
            }
        },
        allow: {
            type: graphQl.list(graphQlEnums.PermissionEnum),
            resolve: function (env) {
                return env.source.allow;
            }
        },
        deny: {
            type: graphQl.list(graphQlEnums.PermissionEnum),
            resolve: function (env) {
                return env.source.deny;
            }
        }
    }
});

exports.UserStoreAccessControlEntry = graphQl.createObjectType({
    name: 'UserStoreAccessControlEntry',
    description: 'Domain representation of user store access control entry',
    fields: {
        principal: {
            type: graphQl.reference('Principal'),
            resolve: function (env) {
                return principals.getByKeys(env.source.principal);
            }
        },
        access: {
            type: graphQlEnums.UserStoreAccessEnum,
            resolve: function (env) {
                return env.source.access;
            }
        }
    }
});

var AuthConfig = graphQl.createObjectType({
    name: 'AuthConfig',
    description: 'Domain representation of auth config for user store',
    fields: {
        applicationKey: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.applicationKey;
            }
        },
        config: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                //TODO: config is not read from db yet, and there's no suitable graphql type for unstructured data
                return JSON.stringify([]);
            }
        }
    }
});

exports.UserStoreType = graphQl.createObjectType({
    name: 'UserStore',
    description: 'Domain representation of a user store',
    interfaces: [UserItemType],
    fields: {
        id: {
            type: graphQl.GraphQLID,
            resolve: function (env) {
                return env.source._id;
            }
        },
        key: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source._name;
            }
        },
        name: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source._name;
            }
        },
        path: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source._path;
            }
        },
        displayName: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.displayName;
            }
        },
        description: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.description;
            }
        },
        authConfig: {
            type: AuthConfig,
            resolve: function (env) {
                return env.source.idProvider;
            }
        },
        idProviderMode: {
            type: graphQlEnums.IdProviderModeEnum,
            resolve: function (env) {
                return env.source.idProviderMode;
            }
        },
        permissions: {
            type: graphQl.list(exports.UserStoreAccessControlEntry),
            resolve: function (env) {
                return env.source.access;
            }
        },
        modifiedTime: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source._timestamp;
            }
        }
    }
});

exports.PrincipalType = graphQl.createObjectType({
    name: 'Principal',
    description: 'Domain representation of a principal',
    interfaces: [UserItemType],
    fields: {
        id: {
            type: graphQl.GraphQLID,
            resolve: function (env) {
                return env.source._id;
            }
        },
        key: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.key || env.source._id;
            }
        },
        name: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source._name;
            }
        },
        path: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source._path;
            }
        },
        displayName: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.displayName;
            }
        },
        description: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.description;
            }
        },
        principalType: {
            type: graphQlEnums.PrincipalTypeEnum,
            resolve: function (env) {
                return env.source.principalType;
            }
        },
        userStoreKey: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.userStoreKey;
            }
        },
        permissions: {
            type: graphQl.list(AccessControlEntry),
            resolve: function (env) {
                return env.source._permissions || [];
            }
        },
        login: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.login;
            }
        },
        email: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.email;
            }
        },
        memberships: {
            type: graphQl.list(graphQl.reference('Principal')),
            resolve: function (env) {
                return graphQlUtils.toArray(env.source.memberships);
            }
        },
        members: {
            type: graphQl.list(graphQl.GraphQLString),
            resolve: function (env) {
                return graphQlUtils.toArray(env.source.member);
            }
        },
        modifiedTime: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source._timestamp;
            }
        }
    }
});

exports.PrincipalDeleteType = graphQl.createObjectType({
    name: 'PrincipalDelete',
    description: 'Result of a principal delete operation',
    fields: {
        principalKey: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.key;
            }
        },
        deleted: {
            type: graphQl.GraphQLBoolean,
            resolve: function (env) {
                return env.source.deleted;
            }
        },
        reason: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.reason;
            }
        }
    }
});

exports.UserStoreDeleteType = graphQl.createObjectType({
    name: 'UserStoreDelete',
    description: 'Result of a userStore delete operation',
    fields: {
        userStoreKey: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.key;
            }
        },
        deleted: {
            type: graphQl.GraphQLBoolean,
            resolve: function (env) {
                return env.source.deleted;
            }
        },
        reason: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.reason;
            }
        }
    }
});

exports.PrincipalConnectionType = graphQlConnection.createConnectionType('Principal', exports.PrincipalType);

var BucketType = graphQl.createObjectType({
    name: 'Bucket',
    description: 'Aggregated result for specific key',
    fields: {
        key: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.key;
            }
        },
        count: {
            type: graphQl.GraphQLInt,
            resolve: function (env) {
                return env.source.docCount;
            }
        }
    }
});

var AggregationType = graphQl.createObjectType({
    name: 'Aggregation',
    description: 'List of buckets',
    fields: {
        name: {
            type: graphQl.GraphQLString,
            resolve: function (env) {
                return env.source.name;
            }
        },
        aggregation: {
            type: graphQl.list(BucketType),
            resolve: function (env) {
                return env.source.aggregation;
            }
        }
    }
});

exports.TypesType = graphQl.createObjectType({
    name: 'Types',
    fields: {
        totalCount: {
            type: graphQl.nonNull(graphQl.GraphQLInt),
            resolve: function (env) {
                return env.source.total;
            }
        },
        aggregations: {
            type: graphQl.list(AggregationType),
            resolve: function (env) {
                var aggregations = env.source.aggregations;
                var aggs = [];
                for (var key in aggregations) {
                    if (aggregations.hasOwnProperty(key)) {
                        aggs.push({
                            name: key,
                            aggregation: aggregations[key].buckets
                        });
                    }
                }
                return aggs;
            }
        }
    }
});
