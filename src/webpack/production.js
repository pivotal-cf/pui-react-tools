const DefinePlugin = require('webpack/lib/DefinePlugin');
const {extractCss, extractSass, noErrors} = require('./webpack.plugins');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

module.exports = {
  plugins: [
    new DefinePlugin({
      'process.env': {
        'NODE_ENV': '"production"'
      }
    }),
    new UglifyJsPlugin({compress: {warnings: false}}),
    noErrors,
    extractCss,
    extractSass
  ]
};