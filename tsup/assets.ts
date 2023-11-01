import type { Options } from '.';

import esbuildPluginExternalGlobal from 'esbuild-plugin-external-global';
import {
	DIR_DST_ASSETS,
	DIR_SRC_ASSETS
} from './constants';

export default function buildAssetConfig(): Options {
    return {
        bundle: true,
        dts: false, // d.ts files are use useless at runtime
        entry: {
            'js/app-users-bundle': `${DIR_SRC_ASSETS}/js/main.ts`,
            'js/crypto-worker': `${DIR_SRC_ASSETS}/js/worker/RSAKeysWorker.ts`,
        },
        esbuildOptions(options, context) {
            options.banner = {
                js: `const jQuery = $;` // jQuery UI Tabbable requires this
            };
        },
        esbuildPlugins: [
            esbuildPluginExternalGlobal.externalGlobalPlugin({
                'jquery': 'window.$'
            })
        ],
        format: [
            'cjs'
        ],
        minify: process.env.NODE_ENV !== 'development',
        noExternal: [ // Same as dependencies in package.json
            /@enonic\/lib-admin-ui/,
            'hasher',
            'jquery', // This will bundle jQuery into the bundle
            'nanoid',
            'owasp-password-strength-test',
            'q'
        ],
        outDir: DIR_DST_ASSETS,
        platform: 'browser',
        silent: ['QUIET', 'WARN'].includes(process.env.LOG_LEVEL_FROM_GRADLE||''),
        sourcemap: process.env.NODE_ENV === 'development',
        tsconfig: `${DIR_SRC_ASSETS}/tsconfig.json`,
    };
}
