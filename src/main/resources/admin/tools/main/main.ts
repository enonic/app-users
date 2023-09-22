import type {
	Request,
	Response,
} from '/types';


import {
    getLauncherPath,
    getLocales
} from '/lib/xp/admin';
// @ts-expect-error Cannot find module '/lib/mustache' or its corresponding type declarations.ts(2307)
import mustache from '/lib/mustache';
// @ts-expect-error Cannot find module '/lib/router' or its corresponding type declarations.ts(2307)
import Router from '/lib/router';
import {
    assetUrl,
    serviceUrl
} from '/lib/xp/portal';
import {localize} from '/lib/xp/i18n';
import {immutableGetter, getAdminUrl} from '/lib/users/urlHelper';
import {
	// FILEPATH_MANIFEST_CJS,
	FILEPATH_MANIFEST_NODE_MODULES,
	GETTER_ROOT,
} from '/constants';

const TOOL_NAME = 'main';
const VIEW = resolve('./main.html');

// @ts-expect-error A function with a name starting with an uppercase letter should only be used as a constructor
const router = Router();

router.all(`/${GETTER_ROOT}/{path:.+}`, (r: Request) => {
	return immutableGetter(r);
});

function get(_request: Request): Response {
    const params = {
        appUsersBundleUrl: getAdminUrl({
            path: 'main.js'
        }, TOOL_NAME),
        cryptoWorkerUrl: getAdminUrl({
            path: 'worker/RSAKeysWorker.js'
        }, TOOL_NAME),
        assetsUri: assetUrl({path: ''}),
        appName: localize({
            key: 'admin.tool.displayName',
            bundles: ['i18n/phrases'],
            locale: getLocales()
        }),
        configServiceUrl: serviceUrl({service: 'config'}),
        jqueryUrl: getAdminUrl({
            manifestPath: FILEPATH_MANIFEST_NODE_MODULES,
            path: 'jquery/dist/jquery.min.js',
        }, TOOL_NAME),
        jqueryUiUrl: getAdminUrl({
            manifestPath: FILEPATH_MANIFEST_NODE_MODULES,
            path: 'jquery-ui/dist/jquery-ui.min.js',
        }, TOOL_NAME),
        launcherPath: getLauncherPath(),
    };

    return {
        contentType: 'text/html',
        body: mustache.render(VIEW, params),
        headers: {
            'content-security-policy': 'default-src \'self\'; script-src \'self\' \'unsafe-eval\'; style-src \'self\' \'unsafe-inline\'; object-src \'none\'; img-src \'self\' data:'
        }
    };
}

router.get('', (r: Request) => get(r)); // Default admin tool path
router.get('/', (r: Request) => get(r)); // Just in case someone adds a slash on the end

export const all = (r: Request) => router.dispatch(r);
