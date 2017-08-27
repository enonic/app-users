var admin = require('/lib/xp/admin');
var mustache = require('/lib/xp/mustache');
var portal = require('/lib/xp/portal');

function handleGet() {
    var baseHref = portal.pageUrl({
        path: '',
        type: 'absolute'
    });
    var graphQlUrl = portal.serviceUrl({
        service: 'graphql'
    });

    var view = resolve('./main.html');

    var params = {
        adminUrl: admin.getBaseUri(),
        adminAssetsUri: admin.getAssetsUri(),
        assetsUri: portal.assetUrl({
            path: ''
        }),
        baseHref: baseHref,
        graphQlUrl: graphQlUrl,
        appName: 'Users',
        appId: app.name,
        xpVersion: app.version,
        messages: admin.getPhrases(),
        launcherUrl: portal.assetUrl({
            path: '/js/launcher',
            application: 'com.enonic.xp.app.main'
        })
    };

    return {
        contentType: 'text/html',
        body: mustache.render(view, params)
    };
}

exports.get = handleGet;
