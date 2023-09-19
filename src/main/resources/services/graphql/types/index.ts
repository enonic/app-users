import {
    IdProviderAccessEnum,
    IdProviderModeEnum,
    PermissionEnum,
    PrincipalTypeEnum,
    SortModeEnum,
    UserItemTypeEnum,
} from './enums';
import {
    IdProviderAccessControlInput,
    IdProviderConfigInput
} from './inputs';
import {
    IdProviderDeleteType,
    IdProviderType,
    PrincipalConnectionType,
    PrincipalDeleteType,
    PrincipalType,
    PublicKeyType,
    RepositoryType,
    TypesType,
    UserItemConnectionType
} from './objects';

export default {
    enums: {
        IdProviderAccessEnum,
        IdProviderModeEnum,
        PermissionEnum,
        PrincipalTypeEnum,
        SortModeEnum,
        UserItemTypeEnum
    },
    inputs: {
        IdProviderAccessControlInput,
        IdProviderConfigInput
    },
    objects: {
        IdProviderDeleteType,
        IdProviderType,
        PrincipalConnectionType,
        PrincipalDeleteType,
        PrincipalType,
        PublicKeyType,
        RepositoryType,
        TypesType,
        UserItemConnectionType
    }
};
