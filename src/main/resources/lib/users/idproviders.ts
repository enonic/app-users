import {
    prettifyName,
    required
} from './common';
import {
    createIdProvider,
    defaultPermissions,
    deleteIdProviders,
    getIdProvider,
    getIdProviderMode as _getIdProviderMode,
    getIdProviders,
    getPermissions as _getPermissions,
    modifyIdProvider
} from './auth';

const DEFAULT_KEY = 'default';

export function getByKey(key) {
    return getIdProvider({key: key});
}

export const list = getIdProviders;

export function getDefault() {
    return {key: 'default'};
}

export function create(params) {
    let name = required(params, 'key');

    return createIdProvider({
        name: prettifyName(name),
        displayName: params.displayName,
        description: params.description,
        idProviderConfig: params.idProviderConfig,
        permissions: params.permissions || []
    });
}

export function update(params) {
    let key = required(params, 'key');

    return modifyIdProvider({
        key: key,
        editor: function (idProvider) {
            let newIdProvider = idProvider;
            newIdProvider.displayName = params.displayName;
            newIdProvider.description = params.description;
            newIdProvider.idProviderConfig = params.idProviderConfig;
            return newIdProvider;
        },
        permissions: params.permissions || []
    });
}

function _delete(keys) {
    return deleteIdProviders({keys: keys});
}
export {_delete as delete};

export function getIdProviderMode(applicationKey) {
    return _getIdProviderMode({key:applicationKey});
}

export function getPermissions(key) {
    if (key === DEFAULT_KEY) {
        return defaultPermissions();
    }
    return _getPermissions({key: key});
}
