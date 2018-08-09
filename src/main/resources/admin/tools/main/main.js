var admin = require('/lib/xp/admin');
var mustache = require('/lib/xp/mustache');
var portal = require('/lib/xp/portal');

function handleGet() {
    var graphQlUrl = portal.serviceUrl({
        service: 'graphql'
    });

    var view = resolve('./main.html');

    var params = {
        adminUrl: admin.getBaseUri(),
        assetsUri: portal.assetUrl({
            path: ''
        }),
        graphQlUrl: graphQlUrl,
        appName: 'Users',
        appId: app.name,
        xpVersion: app.version,
        messages: admin.getPhrases(),
        launcherPath: admin.getLauncherPath(),
        launcherUrl: admin.getLauncherUrl(),
        reportServiceUrl: portal.serviceUrl({
            service: 'permissionReport'
        })
    };

    return {
        contentType: 'text/html',
        body: mustache.render(view, params)
    };
}

exports.get = handleGet;
