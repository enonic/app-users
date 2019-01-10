var graphQl = require('/lib/graphql');

exports.IdProviderModeEnum = graphQl.createEnumType({
    name: 'IdProviderMode',
    description: 'Enumeration of Id provider modes',
    values: {
        LOCAL: 'LOCAL',
        EXTERNAL: 'EXTERNAL',
        MIXED: 'MIXED'
    }
});

exports.SortModeEnum = graphQl.createEnumType({
    name: 'SortMode',
    description: 'Enumeration of sort modes',
    values: {
        ASC: 'ASC',
        DESC: 'DESC'
    }
});

exports.UserItemTypeEnum = graphQl.createEnumType({
    name: 'UserItemType',
    description: 'Enumeration of user item types',
    values: {
        ID_PROVIDER: 'ID_PROVIDER',
        USER: 'USER',
        GROUP: 'GROUP',
        ROLE: 'ROLE'
    }
});

exports.PrincipalTypeEnum = graphQl.createEnumType({
    name: 'PrincipalType',
    description: 'Enumeration of principal types',
    values: {
        USER: 'USER',
        GROUP: 'GROUP',
        ROLE: 'ROLE'
    }
});

exports.PermissionEnum = graphQl.createEnumType({
    name: 'Permission',
    description: 'Enumeration of permissions',
    values: {
        READ: 'READ',
        CREATE: 'CREATE',
        MODIFY: 'MODIFY',
        DELETE: 'DELETE',
        PUBLISH: 'PUBLISH',
        READ_PERMISSIONS: 'READ_PERMISSIONS',
        WRITE_PERMISSIONS: 'WRITE_PERMISSIONS'
    }
});

exports.IdProviderAccessEnum = graphQl.createEnumType({
    name: 'IdProviderAccess',
    description: 'Enumeration of id provider access permissions',
    values: {
        READ: 'READ',
        CREATE_USERS: 'CREATE_USERS',
        WRITE_USERS: 'WRITE_USERS',
        ID_PROVIDER_MANAGER: 'ID_PROVIDER_MANAGER',
        ADMINISTRATOR: 'ADMINISTRATOR'
    }
});
