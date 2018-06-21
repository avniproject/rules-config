const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');


const config = {
    target: 'web',
    entry: {
        rules: "./rules.js"
    },
    output: {
        filename: 'rules.js',
        libraryTarget: 'umd',
        library: 'rulesConfig',
        path: path.resolve(__dirname, 'exports')
    },
    plugins: [
        new UglifyJsPlugin({
            test: /\.js$/,
            exclude: /(node_modules)/,
            uglifyOptions: {
                ecma: 5,
                warnings: false,
                compress: true,
                mangle: true,
                keep_fnames: true,
                keep_classnames: true,
                output: {comments: false, beautify: false}
            }
        }),
        new CopyWebpackPlugin([
            {from: './infra.js', to: 'infra.js'},
            {from: './package.json', to: 'package.json'},
            {from: './package-lock.json', to: 'package-lock.json'}
        ])
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        "presets": [
                            [
                                "env"
                            ]
                        ],
                        "plugins": [
                            "transform-class-properties",
                            "transform-export-extensions",
                            "transform-decorators-legacy",
                            "transform-es2015-destructuring"
                        ]
                    }
                }
            }
        ]
    }
};

module.exports = config;