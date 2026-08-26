import { join } from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite-plus';

const REPO = import.meta.dirname;
const ASSETS = join(REPO, 'assets'); // UI source root
const OUT = join(REPO, 'build/resources/main/assets'); // staged for the jar

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  // ? oxfmt and oxlint run from the repo root, so everything the conventions do not govern is
  // ? listed here: the plain-.js binding to the java beans, its golden test fixtures, and the
  // ? docs and CI files. What is left is assets/, test/ and the packed server TS.
  const ignorePatterns = [
    '**/*.d.ts',
    '.github/**',
    'README.md',
    'src/main/resources/lib/**',
    'src/main/resources/*.yaml',
    'src/test/**',
  ];

  const lint = {
    options: { typeAware: true, typeCheck: true },
    ignorePatterns,
  };

  const fmt = {
    singleQuote: true,
    sortImports: true,
    ignorePatterns,
  };

  // `vp pack` (tsdown) compiles the server-side .ts to per-file CommonJS, mirroring the tree into
  // build/ so XP runs each file in place. Only `extensions/` and `admin/extensions/`: `lib/` stays
  // plain .js — it binds the java beans, and a shared tree would emit over it.
  const pack = {
    entry: [
      join(REPO, 'src/main/resources/extensions/**/*.ts'),
      join(REPO, 'src/main/resources/admin/extensions/**/*.ts'),
      `!${join(REPO, 'src/main/resources/**/*.d.ts')}`,
      `!${join(REPO, 'src/main/resources/**/*.test.ts')}`,
    ],
    root: join(REPO, 'src/main/resources'),
    outDir: join(REPO, 'build/resources/main'),
    format: 'cjs' as const,
    platform: 'node' as const,
    unbundle: true, // per-file output, not one bundle
    outExtensions: () => ({ js: '.js' }), // XP wants .js, not the cjs default .cjs
    deps: { neverBundle: [/^\/lib\//, /^\/extensions\//] }, // absolute XP requires stay external
    target: 'es2023',
    treeshake: false, // XP calls exports.get/all at runtime — don't drop as dead
    clean: false, // must not wipe what `vp build` and processResources put here
    dts: false,
    sourcemap: false,
    report: false,
  };

  // Vitest inherits the Vite config, so `root` is pointed at the repo: the build root is
  // assets/, which would hide every server-side test.
  const test = {
    root: REPO,
    environment: 'node' as const,
    include: [
      'assets/**/*.{test,spec}.{ts,tsx}',
      'src/main/resources/extensions/**/*.{test,spec}.ts',
    ],
    passWithNoTests: true,
    // XP supplies these at runtime; under vitest they resolve to local doubles.
    alias: {
      '/lib/graphql': join(REPO, 'test/mocks/lib-graphql.ts'),
      '/lib/xp/i18n': join(REPO, 'test/mocks/lib-xp-i18n.ts'),
      '/lib/xp/io': join(REPO, 'test/mocks/lib-xp-io.ts'),
      '/extensions': join(REPO, 'src/main/resources/extensions'),
    },
  };

  // @enonic/ui is Preact; alias React to preact/compat so everything shares one runtime.
  const alias = {
    react: 'preact/compat',
    'react-dom': 'preact/compat',
    'react-dom/client': 'preact/compat',
    'react/jsx-runtime': 'preact/jsx-runtime',
  };

  return {
    root: ASSETS,
    plugins: [tailwindcss()],
    resolve: { alias, dedupe: ['preact', 'preact/compat'] },
    cacheDir: join(REPO, 'node_modules/.vite'),
    base: './', // relative asset URLs — served under the extension's own path
    build: {
      outDir: OUT,
      emptyOutDir: false, // shared with `vp pack` and processResources — don't clear it
      target: 'es2023',
      minify: isProd,
      sourcemap: !isProd,
      rollupOptions: {
        // The host loads this with `import()`, so it stays one ES module entry.
        input: { '_static/main': join(ASSETS, 'js/main.ts') },
        // ! Without this the entry's exports are dropped — an app build assumes nothing
        // ! imports the entry, and the host would load an inert module.
        preserveEntrySignatures: 'strict' as const,
        output: {
          format: 'es',
          entryFileNames: '[name].js', // _static/main → _static/main.js
          chunkFileNames: '_static/chunks/[name]-[hash].js',
          assetFileNames: '_static/[name][extname]', // the stylesheet → _static/main.css
        },
      },
    },
    lint,
    fmt,
    pack,
    test,
  };
});
