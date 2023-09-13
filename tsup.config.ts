import { globalExternals } from "@fal-works/esbuild-plugin-global-externals";
// import GlobalsPlugin from "esbuild-plugin-globals";
import { defineConfig } from 'tsup';
// import externalGlobalPlugin from 'esbuild-plugin-external-global';

export default defineConfig(() => {
    return {
        bundle: true,
        dts: false, // d.ts files are use useless at runtime
        entry: {
            'js/app-users-bundle': 'src/main/resources/assets/js/main.ts',
            'js/crypto-worker': 'src/main/resources/assets/js/worker/RSAKeysWorker.ts',
        },
        // esbuildOptions(options, context) {
        //     options.external = [
        //         'jquery'
        //     ]
        // },
        esbuildPlugins: [
            // GlobalsPlugin({
            //     // 'jquery': 'jQuery',
            //     'jquery': '$'
            // }),
            globalExternals({
                'jquery': '$'
                // 'jquery': 'jQuery'
            })
            // externalGlobalPlugin({
            //     // 'react': 'window.React',
            //     // 'react-dom': 'window.ReactDOM',
            //     'jQuery': '$' // It seems jquery is available as $ in the global scope
            //   })
        ],
        // external: [
        //     // This will leave require('jquery') as is in the bundle
        //     // causes: Uncaught ReferenceError: require is not defined
        //     'jquery'
        // ],
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
        outDir: 'build/resources/main/assets',
        platform: 'browser',
        silent: ['QUIET', 'WARN'].includes(process.env.LOG_LEVEL_FROM_GRADLE||''),
        // splitting: false,
        sourcemap: process.env.NODE_ENV === 'development',
        tsconfig: 'src/main/resources/assets/tsconfig.json',
    };
});
