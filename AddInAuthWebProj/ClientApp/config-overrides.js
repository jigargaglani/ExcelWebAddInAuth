const paths = require('react-scripts/config/paths');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Utility function to replace plugins in the webpack config files used by react-scripts
const replacePlugin = (plugins, nameMatcher, newPlugin) => {
    const pluginIndex = plugins.findIndex((plugin) => {
        return plugin.constructor && plugin.constructor.name && nameMatcher(plugin.constructor.name);
    });

    if (pluginIndex === -1) {
        return plugins;
    }

    const nextPlugins = plugins.slice(0, pluginIndex).concat(newPlugin).concat(plugins.slice(pluginIndex + 1));

    return nextPlugins;
};

module.exports = function override(config, env) {
    // Define entry points
    config.entry = {
        app: [
            require.resolve('react-dev-utils/webpackHotDevClient'),
            paths.appIndexJs,
        ],
        login: [
            require.resolve('react-dev-utils/webpackHotDevClient'),
            paths.appPath + '/login/login.js',
        ]
    };

    // Split code into chunks for du & rlgl
    config.output = {
        path: paths.appBuild,
        pathinfo: true,
        filename: '[name].[hash].js',
        chunkFilename: '[id].[hash].chunk.js',
        publicPath: paths.publicUrlOrPath,
        devtoolModuleFilenameTemplate: info =>
            path.resolve(info.absoluteResourcePath),
    };

    // Create a HTML entry for du that only includes code for the app bundle
    const appHtmlPlugin = new HtmlWebpackPlugin({
        inject: true,
        title: 'react_office_web_addin_javascript_sample',
        chunks: ['app'],
        filename: 'index.html',
        template: paths.appHtml,
    });

    // Create a HTML entry for rlgl that only includes code for the login bundle
    const loginHtmlPlugin = new HtmlWebpackPlugin({
        inject: true,
        title: 'react_office_web_addin_javascript_sample',
        chunks: ['login'],
        filename: 'login/login.html',
        template: './login/login.html',
    });

    // Replace the default HTML entry in the webpack config used by react-scripts with the app HTML entry
    config.plugins = replacePlugin(config.plugins, (name) => /HtmlWebpackPlugin/i.test(name), appHtmlPlugin);

    // Add the second HTML plugin for other entry point
    config.plugins.push(loginHtmlPlugin);
    
    return config;
}