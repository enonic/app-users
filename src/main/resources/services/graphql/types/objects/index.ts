import { createConnectionType } from './connection';
import { PrincipalType } from './principal';
import {UserItemType} from './userItem';

export {
    IdProviderDeleteType,
    IdProviderType
} from './idProvider';
export {
    PrincipalDeleteType,
    PublicKeyType
} from './principal';
export { TypesType } from './types';
export { RepositoryType } from './repository';

export { PrincipalType };

export const PrincipalConnectionType = createConnectionType(
    'Principal',
    PrincipalType
);

export const UserItemConnectionType = createConnectionType(
    'UserItem',
    UserItemType
);
