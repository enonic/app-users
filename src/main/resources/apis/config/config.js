/*global app, require*/

const admin = require('/lib/xp/admin');
const portal = require('/lib/xp/portal');

function handleGet() {
    const adminBaseUrl = admin.getBaseUri();
    const toolBaseUrl = admin.getToolUrl(app.name, 'main');
    return {
        status: 200,
        contentType: 'application/json',
        body: {
            adminUrl: adminBaseUrl,
            appId: app.name,
            assetsUri: portal.assetUrl({path: ''}),
            toolUri: toolBaseUrl,
            apis: {
                graphQlUrl: `${toolBaseUrl}/_/${app.name}/graphql`,
                reportServiceUrl: `${toolBaseUrl}/_/${app.name}/permissionReport`,
                i18nUrl: `${toolBaseUrl}/_/${app.name}/i18n`,
            }
        }
    };
}

exports.get = handleGet;
