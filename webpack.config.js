const RelativeErrorsWebpackPlugin = require('./util/relativeErrorsWebpackPlugin');

module.exports = {
    entry: './src/main/resources/assets/js/main.ts',
    output: {
        filename: './build/resources/main/assets/js/bundle.js'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        loaders: [
            {test: /\.tsx?$/, loader: "ts-loader"}
        ]
    },
    plugins: [
        RelativeErrorsWebpackPlugin
    ],
    devtool: 'source-map'
};
