var graphQlConnection = require('./connection');

var graphQlUserStore = require('./userStore');
var graphQlPrincipal = require('./principal');
var graphQlUserItem = require('./userItem');
var graphQlTypes = require('./types');

module.exports = {
    UserStoreType: graphQlUserStore.UserStoreType,
    UserStoreDeleteType: graphQlUserStore.UserStoreDeleteType,
    PrincipalType: graphQlPrincipal.PrincipalType,
    PrincipalDeleteType: graphQlPrincipal.PrincipalDeleteType,
    TypesType: graphQlTypes.TypesType,
    PrincipalConnectionType: graphQlConnection.createConnectionType(
        'Principal',
        graphQlPrincipal.PrincipalType
    ),
    UserItemConnectionType: graphQlConnection.createConnectionType(
        'UserItem',
        graphQlUserItem.UserItemType
    )
};
