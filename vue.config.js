CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
    publicPath: '',
    devServer: {
        historyApiFallback: false,
    },
    configureWebpack: {
        // entry: [
        //     // 'webpack-dev-server/client?http://localhost:9090/',
        // ],
        plugins: [],
    },
    chainWebpack: (config) => config.resolve.symlinks(false),
};
