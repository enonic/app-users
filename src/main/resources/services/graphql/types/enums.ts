import {EnumTypeNames} from '/services/graphql/constants';
import {schemaGenerator} from '../schemaUtil';

export const IdProviderModeEnum = schemaGenerator.createEnumType({
    name: EnumTypeNames.IdProviderMode,
    description: 'Enumeration of Id provider modes',
    values: {
        LOCAL: 'LOCAL',
        EXTERNAL: 'EXTERNAL',
        MIXED: 'MIXED'
    }
});

export const SortModeEnum = schemaGenerator.createEnumType({
    name: EnumTypeNames.SortMode,
    description: 'Enumeration of sort modes',
    values: {
        ASC: 'ASC',
        DESC: 'DESC'
    }
});

export const UserItemTypeEnum = schemaGenerator.createEnumType({
    name: EnumTypeNames.UserItemType,
    description: 'Enumeration of user item types',
    values: {
        ID_PROVIDER: 'ID_PROVIDER',
        USER: 'USER',
        GROUP: 'GROUP',
        ROLE: 'ROLE'
    }
});

export const PrincipalTypeEnum = schemaGenerator.createEnumType({
    name: EnumTypeNames.PrincipalType,
    description: 'Enumeration of principal types',
    values: {
        USER: 'USER',
        GROUP: 'GROUP',
        ROLE: 'ROLE'
    }
});

export const PermissionEnum = schemaGenerator.createEnumType({
    name: EnumTypeNames.Permission,
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

export const IdProviderAccessEnum = schemaGenerator.createEnumType({
    name: EnumTypeNames.IdProviderAccess,
    description: 'Enumeration of id provider access permissions',
    values: {
        READ: 'READ',
        CREATE_USERS: 'CREATE_USERS',
        WRITE_USERS: 'WRITE_USERS',
        ID_PROVIDER_MANAGER: 'ID_PROVIDER_MANAGER',
        ADMINISTRATOR: 'ADMINISTRATOR'
    }
});
