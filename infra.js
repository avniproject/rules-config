const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const request = require('superagent');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const serverURL = (path) => `${process.env.SERVER_URL !== undefined ? process.env.SERVER_URL : 'http://localhost:8021'}/${path}`;

const createRule = (formUUID, type, ruleData, ruleDependencyUUID) =>
    request.post(serverURL("rule"), {
        ruleDependencyUUID: ruleDependencyUUID,
        formUUID: formUUID,
        type: type,
        data: ruleData.metadata,
        uuid: ruleData.uuid,
        name: ruleData.name,
        fnName: ruleData.fn.name,
        executionOrder: ruleData.executionOrder
    }).on('error', console.log)
        .then(() => console.log(`Created Rule: ${ruleData.name} ${ruleData.fn.name}`));

const postAllRules = (organisationName, ruleFilePath) => {
    const compiler = webpack({
        target: 'web',
        entry: {
            rules: ruleFilePath
        },
        output: {
            filename: '[name].bundle.js',
            libraryTarget: 'var',
            library: 'rulesConfig',
            path: path.resolve(__dirname, 'dist')
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
            })
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
    });
    compiler.run((err, stats) => {
        var rulesConfig = undefined;
        const rulesContent = String(fs.readFileSync(path.resolve(__dirname, 'dist') + '/rules.bundle.js'));
        eval(rulesContent);
        const rules = rulesConfig;
        request
            .post(serverURL("ruleDependency"), {
                code: rulesContent,
                hash: stats.hash
            }).set("ORGANISATION-NAME", organisationName)
            .then((response) => {
                console.log(`Created Rule Dependency with UUID: ${response.text}`);
                const registry = rules[Object.keys(rules).find(r => rules[r].registry !== undefined)].registry;
                registry.getAll()
                    .forEach(([ruleKey, rulesData]) => {
                        rulesData.map(ruleData => createRule(ruleKey.formUUID, ruleKey.type, ruleData, response.text));
                    })
            });
    });
};

const postRulesWithoutDependency = (organisationName, rules) => {
    rules.forEach(([ruleKey, rulesData]) => {
        rulesData.map(ruleData => createRule(ruleKey.formUUID, ruleKey.type, ruleData));
    })
};

// postAllRules("","./test/additional/Rulez.js");
module.exports = {postAllRules, postRulesWithoutDependency};