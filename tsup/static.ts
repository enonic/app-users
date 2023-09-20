import type { Options } from '.';


import CopyWithHashPlugin from '@enonic/esbuild-plugin-copy-with-hash';
import TsupPluginManifest from '@enonic/tsup-plugin-manifest';
import {
	DIR_DST,
	DIR_SRC_STATIC
} from './constants';


const DIR_DST_STATIC = `${DIR_DST}/static`;


export default function buildStaticConfig(): Options {
	return {
		bundle: true,
		dts: false,
		// entry,
		entry: {
			'app-users-bundle': 'src/main/resources/static/main.ts',
			'crypto-worker': 'src/main/resources/static/worker/RSAKeysWorker.ts',
		},
		// esbuildOptions(options, context) {
		// 	// options.banner = {
		// 	//     js: `const jQuery = window.$;` // jQuery UI Tabbable requires this
		// 	// };
		// 	// options.external = [
		// 	//     'jquery'
		// 	// ]
		// 	// options.sourcemap = 'external'; // Shows the line in the transpiled code, not the source
		// 	// options.sourcemap = 'both'; // // Shows the line in the transpiled code, not the source
		// },
		esbuildPlugins: [
			CopyWithHashPlugin({
				context: 'node_modules',
				manifest: `node_modules-manifest.json`,
				patterns: [
					'jquery/dist/*.*',
					'jquery-ui/dist/*.*',
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
		// minify: process.env.NODE_ENV !== 'development',
		// minify: true, // ERROR: Causes app-users-bundle-L6FTUX7O.js:1 Uncaught TypeError: Cannot read properties of undefined (reading 'insertChild')

		noExternal: [ // Same as dependencies in package.json
			/@enonic\/lib-admin-ui.*/,
			'hasher',
			// 'jquery', // This will bundle jQuery into the bundle
			'nanoid',
			'owasp-password-strength-test',
			'q'
		],
		outDir: 'build/resources/main/static',
		platform: 'browser',
		silent: ['QUIET', 'WARN'].includes(process.env.LOG_LEVEL_FROM_GRADLE||''),
		splitting: false,
		sourcemap: process.env.NODE_ENV === 'development',

		// INFO: Sourcemaps works when target is set here, rather than in tsconfig.json
		target: 'es2020',

		tsconfig: 'src/main/resources/static/tsconfig.json',
	};
}