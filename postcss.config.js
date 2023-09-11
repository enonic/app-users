const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

const plugins = Object.assign(
    {
        'postcss-normalize': {},
        autoprefixer: {},
        'postcss-sort-media-queries': {sort: 'desktop-first'},
        'postcss-url': {
            basePath: path.resolve('src/main/resources/assets/icons'),
            assetsPath: '../icons/',
            url: 'copy' // Remember to skip woff and woff2 files in build.gradle
            // url: 'inline' // base64 data url inlines the fonts?
            // url: 'rebase' // only manipulates the urls?
        },
    },
    isProd ? {cssnano: {}} : {}
);

module.exports = {
    map: !isProd,
    plugins
};
