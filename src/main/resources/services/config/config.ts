import {
    getBaseUri,
    getToolUrl
} from '/lib/xp/admin';
import {
    assetUrl,
    serviceUrl
} from '/lib/xp/portal';


export function get() {
    return {
        status: 200,
        contentType: 'application/json',
        body: {
            adminUrl: getBaseUri(),
            appId: app.name,
            assetsUri: assetUrl({ path: '' }),
            toolUri: getToolUrl(
                app.name,
                'main'
            ),
            services: {
                graphQlUrl: serviceUrl({ service: 'graphql' }),
                reportServiceUrl: serviceUrl({ service: 'permissionReport' }),
                i18nUrl: serviceUrl({ service: 'i18n' }),
            }
        }
    };
}
