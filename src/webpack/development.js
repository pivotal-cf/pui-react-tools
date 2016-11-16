const HotModuleReplacementPlugin = require('webpack/lib/HotModuleReplacementPlugin');
const {noErrors} = require('./webpack.plugins');

const {assetHost, assetPort} = require('../assets/config');
const publicPath = assetHost ? `//${assetHost}:${assetPort}/` : '/';

module.exports = {
  cache: true,
  devtool: 'source-map',
  entry: {
    application: ['./app/components/application.js', `webpack-hot-middleware/client?path=${`${publicPath}__webpack_hmr`}`]
  },
  externals: null,
  module: {
    loaders: [
      {test: [/\.png(\?|$)/, /\.gif(\?|$)/, /\.eot(\?|$)/, /\.ttf(\?|$)/, /\.woff2?(\?|$)/, /\.jpe?g(\?|$)/], loader: 'url'},
      {test: /\.css$/, exclude: /typography/, loaders: ['style', 'css?sourceMap']},
      {test: /\.css$/, include: /typography/, loaders: ['style', 'css']},
      {test: /\.scss$/, loaders: ['style', 'css?sourceMap', 'sass?sourceMap']},
      {test: /\.jsx?$/, exclude: /node_modules/, loaders: ['babel']}
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
    noErrors
  ],
  watch: true
};