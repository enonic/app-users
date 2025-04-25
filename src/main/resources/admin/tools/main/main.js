/*global app, require*/

const admin = require('/lib/xp/admin');
const mustache = require('/lib/mustache');
const portal = require('/lib/xp/portal');
const i18n = require('/lib/xp/i18n');
const assetLib = require('/lib/enonic/asset');
const authLib = require('/lib/xp/auth');

function getConfigAsJson() {
    const user = authLib.getUser();

    return JSON.stringify({
        adminUrl: admin.getHomeToolUrl(),
        appId: app.name,
        assetsUri: assetLib.assetUrl({path: ''}),
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
        },
        eventApiUrl: portal.apiUrl({
            application: 'admin',
            api: 'event',
        }),
        statusApiUrl: portal.apiUrl({
            application: 'admin',
            api: 'status',
        }),
        launcherUrl: admin.widgetUrl({
            application: 'com.enonic.xp.app.main',
            widget: 'launcher',
            params: {
                appName: app.name,
                theme: 'dark',
            }
        }),
        user,
        principals: authLib.getMemberships(user.key, true)
    }, null, 4).replace(/<(\/?script|!--)/gi, "\\u003C$1");
}

function handleGet(req) {
    const view = resolve('./main.html');

    const params = {
        assetsUri: assetLib.assetUrl({path: ''}),
        appName: i18n.localize({
            key: 'admin.tool.displayName',
            bundles: ['i18n/phrases'],
            locale: req.locales
        }),
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
