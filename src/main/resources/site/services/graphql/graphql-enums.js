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

exports.UserStoreAccessEnum = graphQl.createEnumType({
    name: 'UserStoreAccess',
    description: 'Enumeration of user store access permissions',
    values: {
        READ: 'READ',
        CREATE_USERS: 'CREATE_USERS',
        WRITE_USERS: 'WRITE_USERS',
        USER_STORE_MANAGER: 'USER_STORE_MANAGER',
        ADMINISTRATOR: 'ADMINISTRATOR'
    }
});