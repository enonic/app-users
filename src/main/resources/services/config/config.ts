import {
    getBaseUri,
    getToolUrl
} from '/lib/xp/admin';
import {
    assetUrl,
    serviceUrl
} from '/lib/xp/portal';
import {getAdminUrl} from '/lib/users/urlHelper';

const TOOL_NAME = 'main';

export function get() {
    return {
        status: 200,
        contentType: 'application/json',
        body: {
            adminUrl: getBaseUri(),
            appId: app.name,
            assetsUri: assetUrl({path: ''}),
            toolUri: getToolUrl(
                app.name,
                TOOL_NAME
            ),
            cryptoWorkerUrl: getAdminUrl({
                path: 'worker/RSAKeysWorker.js'
            }, TOOL_NAME),
            services: {
                graphQlUrl: serviceUrl({service: 'graphql'}),
                reportServiceUrl: serviceUrl({service: 'permissionReport'}),
                i18nUrl: serviceUrl({service: 'i18n'}),
            }
        }
    };
}
