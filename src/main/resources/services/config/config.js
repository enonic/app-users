/*global app, require*/

var admin = require('/lib/xp/admin');
var portal = require('/lib/xp/portal');

function handleGet() {
    return {
        status: 200,
        contentType: 'application/json',
        body: {
            adminUrl: admin.getBaseUri(),
            appId: app.name,
            assetsUri: portal.assetUrl({path: ''}),
            toolUri: admin.getToolUrl(
                app.name,
                'main'
            ),
            services: {
                graphQlUrl: portal.serviceUrl({ service: 'graphql'}),
                reportServiceUrl: portal.serviceUrl({service: 'permissionReport'}),
                i18nUrl: portal.serviceUrl({service: 'i18n'}),
            }
        }
    };
}

exports.get = handleGet;
