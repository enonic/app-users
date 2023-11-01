import type { Options } from '.';


import CopyWithHashPlugin from '@enonic/esbuild-plugin-copy-with-hash';
import TsupPluginManifest from '@enonic/tsup-plugin-manifest';
import GlobalsPlugin from 'esbuild-plugin-globals';

import {
	DIR_DST_STATIC,
	DIR_SRC_STATIC
} from './constants';


export default function buildStaticConfig(): Options {
	return {
		bundle: true,
		dts: false,
		entry: {
			'app-users-bundle': `${DIR_SRC_STATIC}/main.ts`,
			'crypto-worker': `${DIR_SRC_STATIC}/worker/RSAKeysWorker.ts`,
		},
		esbuildOptions(options, context) {
			options.keepNames = true;
		},
		esbuildPlugins: [
			GlobalsPlugin({
				'@enonic/legacy-slickgrid.*'(modulename) {
					return 'Slick';
				},
				'dompurify': 'DOMPurify',
				'hasher': 'hasher',
				'jquery': '$',
				'mousetrap': 'Mousetrap',
				'owasp-password-strength-test': 'owaspPasswordStrengthTest',
				// 'q': 'Q',
				'signals': 'signals',
			}),
			CopyWithHashPlugin({
				context: 'node_modules',
				manifest: `node_modules-manifest.json`,
				patterns: [
					'@enonic/legacy-slickgrid/index.js',
					'dompurify/dist/*.js',
					'hasher/dist/js/*.js',
					'jquery/dist/*.*',
					'jquery-ui-dist/*.*',
					'mousetrap/mousetrap*.js',
					'owasp-password-strength-test/owasp-password-strength-test.js',
					// 'q/*.js',
					'signals/dist/*.js',
				]
			}),
			TsupPluginManifest({
				generate: (entries) => {// Executed once per format
					const newEntries = {};
					Object.entries(entries).forEach(([k,v]) => {
						console.log(k,v);
						const ext = v.split('.').pop() as string;
						const parts = k.replace(`${DIR_SRC_STATIC}/`, '').split('.');
						parts.pop();
						parts.push(ext);
						newEntries[parts.join('.')] = v.replace(`${DIR_DST_STATIC}/`, '');
					});
					return newEntries;
				}
			}),
		],
		format: [
			'cjs'
		],

		minify: false,

		// NOTE: By default tsup bundles all import-ed modules except dependencies and peerDependencies.
		noExternal: [
			/@enonic\/lib-admin-ui.*/,
			'nanoid', // nanoid@5 can't be CJS globalized
			'q', // There are errors when trying to use Q as a global
			// These need to be listed here for esbuildPluginExternalGlobal to work
			/@enonic\/legacy-slickgrid.*/,
			'dompurify',
			'jquery',
			'hasher',
			'mousetrap',
			'owasp-password-strength-test',
			'signals'
		],
		outDir: DIR_DST_STATIC,
		platform: 'browser',
		silent: ['QUIET', 'WARN'].includes(process.env.LOG_LEVEL_FROM_GRADLE||''),
		splitting: false,
		sourcemap: process.env.NODE_ENV === 'development',

		// INFO: Sourcemaps works when target is set here, rather than in tsconfig.json
		target: 'es2020',

		tsconfig: `${DIR_SRC_STATIC}/tsconfig.json`,
	} as Options;
}
