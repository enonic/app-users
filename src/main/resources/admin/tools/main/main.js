/*global app, require*/

const admin = require('/lib/xp/admin');
const mustache = require('/lib/mustache');
const portal = require('/lib/xp/portal');
const i18n = require('/lib/xp/i18n');

function getConfigAsJson() {
    return JSON.stringify({
        adminUrl: admin.getBaseUri(),
        appId: app.name,
        assetsUri: portal.assetUrl({path: ''}),
        toolUri: admin.getToolUrl(app.name, 'main'),
        apis: {
            graphQlUrl: portal.apiUrl({
                application: app.name,
                api: 'graphql',
            }),
            reportServiceUrl: portal.apiUrl({
                application: app.name,
                api: 'permissionReport',
            }),
            i18nUrl: portal.apiUrl({
                application: app.name,
                api: 'i18n',
            }),
        }
    }, null, 4).replace(/<(\/?script|!--)/gi, "\\u003C$1");
}

function handleGet() {
    const view = resolve('./main.html');

    const params = {
        assetsUri: portal.assetUrl({path: ''}),
        appName: i18n.localize({
            key: 'admin.tool.displayName',
            bundles: ['i18n/phrases'],
            locale: admin.getLocales()
        }),
        launcherPath: admin.getLauncherPath(),
        toolBaseUrl: admin.getToolUrl(app.name, 'main'),
        toolAppName: app.name,
        configScriptId: 'app-users-config-as-json',
        configAsJson: getConfigAsJson(),
    };

    return {
        contentType: 'text/html',
        body: mustache.render(view, params),
        headers: {
            'Content-Security-Policy': 'default-src \'self\'; script-src \'self\' \'unsafe-eval\'; style-src \'self\' \'unsafe-inline\'; object-src \'none\'; img-src \'self\' data:'
        }
    };
}

exports.get = handleGet;
