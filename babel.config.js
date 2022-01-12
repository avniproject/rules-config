module.exports = {
    presets: [

        "@babel/preset-env",
        '@babel/preset-typescript',
        "@babel/preset-flow"
    ],
    plugins: [
        "@babel/plugin-proposal-export-default-from",
        "@babel/plugin-proposal-object-rest-spread",
        ["@babel/plugin-proposal-decorators", { "legacy" : true }],
        "@babel/plugin-proposal-class-properties",
    ],
    env: {
        "test": {
            "plugins": [
                [
                    "istanbul"
                ]
            ]
        }
    },
    sourceMaps: true,
};
