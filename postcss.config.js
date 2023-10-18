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
            url: 'copy'
        },
    },
    isProd ? {cssnano: {}} : {}
);

module.exports = {
    map: !isProd,
    plugins
};
