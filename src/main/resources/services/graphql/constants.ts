// Single common enum to avoid name collisions
const enum UniqNames {
    Aggregation = 'Aggregation',
    Bucket = 'Bucket',
    IdProvider = 'IdProvider',
    IdProviderAccess = 'IdProviderAccess',
    IdProviderAccessControlEntry = 'IdProviderAccessControlEntry',
    IdProviderAccessControlInput = 'IdProviderAccessControlInput',
    IdProviderConfig = 'IdProviderConfig',
    IdProviderConfigInput = 'IdProviderConfigInput',
    IdProviderDelete = 'IdProviderDelete',
    IdProviderMode = 'IdProviderMode',
    Mutation = 'Mutation',
    PageInfo = 'PageInfo',
    Permission = 'Permission',
    Principal = 'Principal',
    PrincipalAccessControlEntry = 'PrincipalAccessControlEntry',
    PrincipalDelete = 'PrincipalDelete',
    PrincipalInput = 'PrincipalInput',
    PrincipalType = 'PrincipalType',
    PublicKey = 'PublicKey',
    Query = 'Query',
    Repository = 'Repository',
    SortMode = 'SortMode',
    Types = 'Types',
    UserItem = 'UserItem',
    UserItemType = 'UserItemType'
}

export const enum EnumTypeNames {
    IdProviderAccess = UniqNames.IdProviderAccess,
    IdProviderMode = UniqNames.IdProviderMode,
    Permission = UniqNames.Permission,
    PrincipalType = UniqNames.PrincipalType,
    SortMode = UniqNames.SortMode,
    UserItemType = UniqNames.UserItemType
}

export const enum InterfaceTypeNames {
    UserItem = UniqNames.UserItem
}

export const enum ObjectTypeNames {
    Aggregation = UniqNames.Aggregation,
    Bucket = UniqNames.Bucket,
    IdProvider = UniqNames.IdProvider,
    IdProviderAccessControlEntry = UniqNames.IdProviderAccessControlEntry,
    IdProviderConfig = UniqNames.IdProviderConfig,
    IdProviderDelete = UniqNames.IdProviderDelete,
    Mutation = UniqNames.Mutation,
    PageInfo = UniqNames.PageInfo,
    Principal = UniqNames.Principal,
    PrincipalAccessControlEntry = UniqNames.PrincipalAccessControlEntry,
    PrincipalDelete = UniqNames.PrincipalDelete,
    PublicKey = UniqNames.PublicKey,
    Repository = UniqNames.Repository,
    Query = UniqNames.Query,
    Types = UniqNames.Types
}

export const enum InputTypeNames {
    IdProviderAccessControlInput = UniqNames.IdProviderAccessControlInput,
    IdProviderConfigInput = UniqNames.IdProviderConfigInput,
    PrincipalInput = UniqNames.PrincipalInput
}
