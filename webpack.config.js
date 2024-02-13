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
                        "presets": ['@babel/preset-env'],
                        "plugins": [
                            "@babel/plugin-proposal-class-properties",
                            "@babel/plugin-syntax-export-extensions",
                            ["@babel/plugin-proposal-decorators", { "legacy" : true }],
                            "@babel/plugin-transform-destructuring"
                        ]
                    }
                }
            }
        ]
    }
};

module.exports = config;
