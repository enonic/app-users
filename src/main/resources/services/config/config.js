/*global app, require*/

const admin = require('/lib/xp/admin');
const portal = require('/lib/xp/portal');
const assetLib = require('/lib/enonic/asset');

function handleGet() {
    const baseUri = admin.getBaseUri();
    return {
        status: 200,
        contentType: 'application/json',
        body: {
            adminUrl: baseUri,
            appId: app.name,
            assetsUri: assetLib.assetUrl({path: ''}),
            toolUri: admin.getToolUrl(
                app.name,
                'main'
            ),
            services: {
                graphQlUrl: portal.serviceUrl({ service: 'graphql'}),
                reportServiceUrl: portal.serviceUrl({service: 'permissionReport'}),
                i18nUrl: portal.serviceUrl({service: 'i18n'}),
            },
            statusApiUrl: `${baseUri}/rest/status`,
            eventApiUrl: `${baseUri}/event`,
        }
    };
}

exports.get = handleGet;
