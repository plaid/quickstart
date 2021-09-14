const path = require('path'),
    webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    devServer: {
        allowedHosts: 'all',
        static: {
          directory: path.resolve(__dirname, 'public')
        },
        historyApiFallback: true,
        hot: "only",
        host: '0.0.0.0',
        port: 3000,
      },
}