import { defineConfig } from 'tsup';

export default defineConfig(() => {
    return {
        dts: false, // d.ts files are use useless at runtime
        entry: {
            'js/bundle': 'src/main/resources/assets/js/main.ts',
            'js/crypto-worker': 'src/main/resources/assets/js/worker/RSAKeysWorker.ts',
        },
        format: [
            'cjs'
        ],
        minify: process.env.NODE_ENV === 'development' ? false : true,
        outDir: 'build/resources/main/assets',
        platform: 'browser',
		silent: ['QUIET', 'WARN'].includes(process.env.LOG_LEVEL_FROM_GRADLE||''),
        // splitting: false,
        sourcemap: process.env.NODE_ENV === 'development' ? true : false,
        tsconfig: 'src/main/resources/assets/tsconfig.json',
    };
});
