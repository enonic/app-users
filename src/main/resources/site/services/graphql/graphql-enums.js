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