const HotModuleReplacementPlugin = require('webpack/lib/HotModuleReplacementPlugin');
const {noEmitOnErrors} = require('./webpack.plugins');

const {assetHost, assetPort} = require('../assets/config');
const publicPath = assetHost ? `//${assetHost}:${assetPort}/` : '/';

module.exports = {
  cache: true,
  devtool: 'source-map',
  entry: {
    application: ['./app/components/application.js', `webpack-hot-middleware/client?path=${`${publicPath}__webpack_hmr`}`]
  },
  module: {
    rules: [
      {test: [/\.png(\?|$)/, /\.gif(\?|$)/, /\.eot(\?|$)/, /\.ttf(\?|$)/, /\.woff2?(\?|$)/, /\.jpe?g(\?|$)/], loader: 'url'},
      {test: /\.css$/, exclude: /typography/, use: [{loader: 'style-loader'}, {loader: 'css-loader?sourceMap'}]},
      {test: /\.css$/, include: /typography/, use: [{loader: 'style-loader'}, {loader: 'css-loader'}]},
      {test: /\.scss$/, use: [{loader: 'style-loader'}, {loader: 'css-loader?sourceMap'}, {loader: 'sass-loader?sourceMap'}]},
      {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader'}
    ]
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[id].js',
    path: __dirname,
    pathinfo: true,
    publicPath
  },
  plugins: [
    new HotModuleReplacementPlugin(),
    noEmitOnErrors
  ],
  watch: true
};